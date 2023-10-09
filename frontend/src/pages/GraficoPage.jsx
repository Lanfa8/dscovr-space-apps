
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import moment from "moment/moment";
import { Bar } from 'react-chartjs-2'
import { arrayToGraphData, getKpInfo } from "../utils";
import { useQuery } from "react-query";

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
const LIMIT = 5;

function saveEmail(){
    window.location.reload()
}

export function GraficoPage(){

    const predictionURL = new URL('get_prediction', import.meta.env.VITE_API_URL);
    predictionURL.searchParams.append('date', moment().format('y-M-D'));

    const query = useQuery({
        queryKey: ['predictions', moment('2022-10-12').format('y-M-dd')],
        queryFn: () => fetch(predictionURL).then(res => res.json()),
        retry: false,
        cacheTime: Infinity,
        staleTime: Infinity
    })

    const [labels, values, backgroundColors] = query.isSuccess ? arrayToGraphData(query.data, UNITS_AHEAD, TIME_SCALE, LIMIT) : [ [], [], [] ];
    
    const lastData = query.data?.at(-1)
    const lastTime = lastData?.data
    const lastKp = lastData?.value
    const kpInfo = lastKp ? getKpInfo(lastKp) : undefined

    const data = {
        labels,
        datasets: [
            {
                label: 'Geomagnetic storm index',
                data: values,
                backgroundColor: backgroundColors,
            }
        ],
    };

    return <>
        <div className="graph-wrapper">
            <div>
            <div className="graph-container">
                {query.error && <>Ops... Something went wrong trying to predict the storms</>}
                {query.isSuccess && <Bar 
                    options={options}
                    data={data}
                />}
            </div>
            <div>
                <span className="text-disabled">Receive geomagnetic storm alerts by email: </span>
                <input type='email' placeholder='example@example.com' />
                <button onClick={saveEmail}>Send</button>
            </div>
            </div>
          {kpInfo && <div className="kp-info">
            <h3>Current geomagnetic storm index: <p style={{ color: kpInfo.color}}>{lastKp}</p> </h3>
            {lastTime && <small className="text-disabled">Last updated at : {moment(lastTime).format('DD/M/y hh:mm')}</small>}
            <p className="text-emphasis">{kpInfo.text}</p>
          </div>}
        </div>
    </>
}
  