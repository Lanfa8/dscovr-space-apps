
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import moment from "moment/moment";
import { Bar } from 'react-chartjs-2'
import { arrayToGraphData, getKpInfo, randomIntBetween } from "../utils";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  
const options = {
    responsive: true,
    plugins: {
        legend: {
        display: false
        },
    },

    scales: {
        y: {
        min: 0,
        max: 9,
        ticks: {
            stepSize: 1,
            color: 'rgba(0 ,0 ,0, 0.8)',
        },
        grid: {
                display:false,
            },
        },
        x: {
            ticks: {
                stepSize: 1,
                color: 'rgba(0 ,0 ,0, 0.8)',
            },
        grid: {
                display:false,
            },
        }
    },
};

const TIME_SCALE = 3;
const UNITS_AHEAD = 3;

const MOCK_DATA = [
    { time: moment().subtract(3 * 4, 'hours').toISOString(), value: 5},
    { time: moment().subtract(3 * 3, 'hours').toISOString(), value: randomIntBetween(0,9) },
    { time: moment().subtract(3 * 2, 'hours').toISOString(), value: randomIntBetween(0,9) },
    { time: moment().subtract(3 * 1, 'hours').toISOString(), value: randomIntBetween(0,9) },
    { time: moment().toISOString(), value: randomIntBetween(0,9) },
];

function saveEmail(){
    window.location.reload()
}

export function GraficoPage(){
    const [labels, values, backgroundColors] = arrayToGraphData(MOCK_DATA, UNITS_AHEAD, TIME_SCALE);
    const lastData = MOCK_DATA.at(-1)

    const lastTime = moment(lastData.data)
    const lastKp = lastData.value
    const kpInfo = getKpInfo(lastKp)
    
    const data = {
        labels,
        datasets: [
            {
                label: 'Indice de tempestades',
                data: values,
                backgroundColor: backgroundColors,
            }
        ],
    };

    return <>
        <div className="graph-wrapper">
            <div>
            <div className="graph-container">
                <Bar 
                options={options}
                data={data}
                />
            </div>
            <div>
                <span className="text-disabled">Receive geomagnetic storm alerts by email: </span>
                <input type='email' placeholder='example@example.com' />
                <button onClick={saveEmail}>Send</button>
            </div>
            </div>
          <div className="kp-info">
            <h3>Current geomagnetic storm index: <p style={{ color: kpInfo.color}}>{lastKp}</p> </h3>
            <small className="text-disabled">Last updated at : {lastTime.format('DD/M/y hh:mm')}</small>
            <p className="text-emphasis">{kpInfo.text}</p>
          </div>
        </div>
    </>
  }
  