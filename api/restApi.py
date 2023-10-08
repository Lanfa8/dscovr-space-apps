from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from keras.models import load_model
from datetime import datetime, timedelta
import pandas as pd
import logging
from sklearn.preprocessing import MinMaxScaler
import numpy as np

app = Flask(__name__)
api = Api(app)

STUDENTS = {
  '1': {'name': 'Mark', 'age': 23, 'spec': 'math'},
  '2': {'name': 'Jane', 'age': 20, 'spec': 'biology'},
  '3': {'name': 'Peter', 'age': 21, 'spec': 'history'},
  '4': {'name': 'Kate', 'age': 22, 'spec': 'science'},
}

def getLoadedModel():
  return load_model('modeloFinal.h5')

def validate(date_text):
  try:
      datetime.fromisoformat(date_text)
      return True
  except ValueError:
      return False

def filter_by_date_range(filename, start_date, end_date):
    df = pd.read_csv(filename, header=None, parse_dates=[0])
    
    mask = (df.iloc[:, 0].dt.date >= pd.Timestamp(start_date).date()) & (df.iloc[:, 0].dt.date <= pd.Timestamp(end_date).date())
    return df[mask]

def subtract_days(iso_date, days_to_subtract):
    date_obj = datetime.fromisoformat(iso_date)
    new_date = date_obj - timedelta(days=days_to_subtract)
    return new_date.isoformat()

def fillGaps(data):   
  for column in data.columns:
      median_value = data[column].median()
      data[column].fillna(median_value, inplace=True)

  return data

def resampleData(data_scaled, dates):
  #JUNCAO DOS DADOS COM OS DADOS REAIS
  data_scaled.insert(0, 0, dates)

  # Agora defina essa coluna como índice
  data_scaled.set_index(0, inplace=True)

  # Primeiro, resample dos dados
  data_resampled = data_scaled.resample('180T').mean(numeric_only=True)

  return data_resampled

def removeAnomalies(data):
  temp_data = data.copy()
  temp_data.set_index(temp_data.columns[0], inplace=True)

  #temp_data.sort_index(inplace=True)
  temp_data = temp_data[~temp_data.index.duplicated(keep='first')]

  fator = 1.5
  Q1 = temp_data.quantile(0.25)
  Q3 = temp_data.quantile(0.75)
  IQR = Q3 - Q1
  outliers_mask = ((temp_data < (Q1 - fator * IQR)) | (temp_data > (Q3 + fator * IQR)))

  # Agora, calculamos a proporção de outliers em uma janela móvel de 1 hora
  rolling_outliers = outliers_mask.rolling(window='1H').sum() / 60  # 60 registros por hora

  # Identificamos quais janelas têm proporção baixa de outliers (menos de 20%)
  low_outliers_windows = rolling_outliers[rolling_outliers < 0.20].index

  # Identificamos os outliers específicos que estão nas janelas com proporção baixa de outliers
  outliers_to_replace = outliers_mask.loc[low_outliers_windows]

  # Substituir os outliers identificados pela mediana de sua janela de 1 hora
  for column in temp_data.columns:
      column_median = temp_data[column].rolling(window='1H').median()
      temp_data[column].where(~outliers_to_replace[column], column_median, inplace=True)

      
  temp_data.reset_index(inplace=True)

  return temp_data

def insertLagFeatures(data_resampled):
  # Adicionando lag features para cada coluna
  lags = 8
  for column in data_resampled.columns:
      for i in range(1, lags + 1):
          data_resampled[f'{column}_lag_{i}'] = data_resampled[column].shift(i)


  #DESCARTA AS LINHAS COM NULL (PRIMEIRA 8 LINHAS PORQUE NAO TEM DADOS PASSADOS)
  data_resampled = data_resampled.dropna()

  return data_resampled

class Prediction(Resource):
  def get(self):
    desired_date = request.args.get('date')

    if (not validate(desired_date)):
      return "Incorret date parameter", 404
    
    data = filter_by_date_range("dsc_fc_summed_spectra_2022_v01.csv", subtract_days(desired_date, 1), desired_date)
    data = fillGaps(data)

    without_anomalies_data = removeAnomalies(data)

    dates = without_anomalies_data[0].values
    scaler = MinMaxScaler()
    data_scaled_values = scaler.fit_transform(without_anomalies_data.drop(columns=[0]))
    data_scaled = pd.DataFrame(data_scaled_values, columns=data.columns[1:])

    resampled = resampleData(data_scaled, dates) 
    finalFullData = insertLagFeatures(resampled)

    predictions = (getLoadedModel().predict(finalFullData)).tolist()

    logging.warning(predictions)
    logging.warning(resampled)

    result_array = [{'date': str(k), 'prediction': v[0]} for k, v in zip(dates, predictions)]

    return jsonify(result_array)

api.add_resource(Prediction, '/get_prediction')

if __name__ == "__main__":
  app.run(debug=True)

