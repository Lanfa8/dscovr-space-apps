#!/usr/bin/env python
# coding: utf-8

# In[4]:


import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns


# 1. Carregamento e Limpeza dos Dados
# Carregar os dados em um DataFrame pandas
data_path = "summed_spectra_2017_2022.csv"
data = pd.read_csv(data_path, delimiter='\t', parse_dates=[0], infer_datetime_format=True, na_values='0', header=None)




# In[5]:


# 2. Análise Exploratória
# Visualize as primeiras linhas para ter uma ideia dos dados
print(data.head())


print("Describe")
# Estatísticas descritivas
print(data.describe())


# In[ ]:


sample_data = data.sample(n=2000, random_state=42)
correlation_matrix = sample_data.corr()
plt.figure(figsize=(60, 30))
sns.heatmap(correlation_matrix, cmap="coolwarm", annot=True)
plt.title("Correlation Matrix")
plt.show()



# In[12]:


selected_columns = data.columns[1:40]
sns.boxplot(data=data[selected_columns])

plt.title("Antes da remoção de anomalias")

plt.xticks(rotation=90)
plt.show()




# In[6]:


# PREENCHE OS NAN COM A MEDIANA DA COLUNA

for column in data.columns:
    median_value = data[column].median()
    data[column].fillna(median_value, inplace=True)


# In[7]:


# REMOCAO DAS ANOMALIAS

print(data.head(525603))
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




# In[16]:


selected_columns = temp_data.columns[1:40]
sns.boxplot(data=temp_data[selected_columns])

plt.title("Depois da remoção de anomalias")

plt.xticks(rotation=90)
plt.show()



# In[18]:


# NORMALIZACAO

dates = temp_data[0].values

from sklearn.preprocessing import MinMaxScaler

dates = temp_data[0].values
scaler = MinMaxScaler()
data_scaled_values = scaler.fit_transform(temp_data.drop(columns=[0]))
data_scaled = pd.DataFrame(data_scaled_values, columns=data.columns[1:])
data_scaled.insert(0, 'Date', dates)


# In[19]:


#JUNCAO DOS DADOS COM OS DADOS REAIS
data_scaled.insert(0, 0, dates)

# Agora defina essa coluna como índice
data_scaled.set_index(0, inplace=True)

# Primeiro, resample dos dados
data_resampled = data_scaled.resample('180T').mean(numeric_only=True)


# Adicionando lag features para cada coluna
lags = 8
for column in data_resampled.columns:
    for i in range(1, lags + 1):
        data_resampled[f'{column}_lag_{i}'] = data_resampled[column].shift(i)


#DESCARTA AS LINHAS COM NULL (PRIMEIRA 8 LINHAS PORQUE NAO TEM DADOS PASSADOS)
data_resampled = data_resampled.dropna()

kp_data = pd.read_csv("kp_2017_2022.csv", header=None, delimiter='\t')

print(kp_data.head(100))

kp_data_selected = kp_data.iloc[:, [0, 1]]


# Converter a primeira coluna para datetime e remover a informação de fuso horário
kp_data_selected[0] = pd.to_datetime(kp_data_selected[0]).dt.tz_localize(None)


# Combinar os dados
combined_data = pd.merge(data_resampled, kp_data_selected, left_on=0, right_on=0, how="left")




# In[1]:


#AJUSTA OS DADOS PARA O MODELO NEURAL

from sklearn.model_selection import train_test_split
import numpy as np
X = combined_data.drop(columns=combined_data.columns[-1])  # Descartando a última coluna (que é seu target) para criar os recursos
y = combined_data[combined_data.columns[-1]]  # Usando a última coluna como target

X = X.iloc[:, 1:]


#GARANTIR O DESLOCAMENTO TEMPORAL (NECESSARIO QUANDO USADO COM LAG FEATURES PARA NÃO USAR O FUTURO PARA PREVER O PASSADO)

train_size = int(0.6 * len(X))
val_size = int(0.20 * len(X))

print(lags)

X_train = X[:train_size-lags]
y_train = y[:train_size-lags]

X_val = X[train_size-lags:train_size+val_size-lags]
y_val = y[train_size-lags:train_size+val_size-lags]

X_test = X[train_size+val_size-lags:]
y_test = y[train_size+val_size-lags:]



print("Training set:", X_train.shape, y_train.shape)
print("Validation set:", X_val.shape, y_val.shape)
print("Test set:", X_test.shape, y_test.shape)

print("Primeiros índices de X_train e y_train:", X_train.index[0], y_train.index[0])
print("Últimos índices de X_train e y_train:", X_train.index[-1], y_train.index[-1])

print("Primeiros índices de X_val e y_val:", X_val.index[0], y_val.index[0])
print("Últimos índices de X_val e y_val:", X_val.index[-1], y_val.index[-1])

print("Primeiros índices de X_test e y_test:", X_test.index[0], y_test.index[0])
print("Últimos índices de X_test e y_test:", X_test.index[-1], y_test.index[-1])

print(X.tail());


# In[27]:


import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras import regularizers
early_stopping = EarlyStopping(monitor='val_loss', patience=60, restore_best_weights=True)


regularizer = 0.00001
learning_rate = 0.00005

# 1. Construa o modelo
model = keras.Sequential([
    layers.Input(shape=(X_train.shape[1],)),
    layers.Dense(256, activation='relu', kernel_regularizer=regularizers.l2(regularizer)),
    layers.Dropout(0.2),
    layers.Dense(128, activation='relu', kernel_regularizer=regularizers.l2(regularizer)),
    layers.Dropout(0.2),
    layers.Dense(64, activation='relu', kernel_regularizer=regularizers.l2(regularizer)),
    layers.Dropout(0.2),
    layers.Dense(32, activation='relu', kernel_regularizer=regularizers.l2(regularizer)),
    layers.Dropout(0.2),
    layers.Dense(1)
])

# 2. Compile o modelo
optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
model.compile(optimizer=optimizer, loss='mse', metrics=['mae'])


# 3. Treine o modelo
history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=1000,
    batch_size=32,
    callbacks=[early_stopping]
)



# In[28]:


#Métricas

train_loss = history.history['loss']
val_loss = history.history['val_loss']
train_mae = history.history['mae']
val_mae = history.history['val_mae']

import matplotlib.pyplot as plt

# Plotando a Loss (MSE) ao longo das épocas
plt.figure(figsize=(12, 6))

plt.subplot(1, 2, 1)
plt.plot(train_loss, label='Training Loss', color='blue')
plt.plot(val_loss, label='Validation Loss', color='red')
plt.title('Loss (MSE) over Epochs')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()

# Plotando a MAE ao longo das épocas
plt.subplot(1, 2, 2)
plt.plot(train_mae, label='Training MAE', color='blue')
plt.plot(val_mae, label='Validation MAE', color='red')
plt.title('Mean Absolute Error over Epochs')
plt.xlabel('Epochs')
plt.ylabel('MAE')
plt.legend()

plt.tight_layout()
plt.show()


# In[29]:


# 4. Avalie o modelo
loss, mae = model.evaluate(X_test, y_test)



# In[30]:


# 5. Faça previsões

predictions = model.predict(X_test)

# 2. Converta os arrays em Series (para facilitar a manipulação)
real_values = pd.Series(y_test.values.flatten())
predicted_values = pd.Series(predictions.flatten())

# 3. Concatene as Series em um DataFrame para visualização
comparison = pd.DataFrame({'Real Values': real_values, 'Predicted Values': predicted_values})

# 4. Imprima os valores
print(comparison.head(200))


# Se desejar salvar o modelo
model.save('modelo.h5')


# In[ ]:




