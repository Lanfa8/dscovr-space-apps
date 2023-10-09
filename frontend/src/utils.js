import moment from "moment";
import { KPColorsEnum } from "./enums/KPColorsEnum";

export function getKpInfo(Kp){
    if(Kp < 5){
      return {
        color: KPColorsEnum.GREEN,
        text: 'No geomagnetic storms'
      };
    }
    
    if(Kp > 7){
        return {
            color: KPColorsEnum.RED,
            text: 'Severe level of geomagnetic storm, with possible widespread problems with voltage control and protection systems that could erroneously disconnect key assets from the power grid. There is also the risk of surface charge and tracking problems on satellites. Induced currents in pipelines can affect preventive measures, and HF radio propagation can be sporadic. Satellite navigation and low-frequency radio may also be impaired, with the Northern Lights visible at lower latitudes.'
        }
    }

    const kpMap = {
        '5': {
            color: KPColorsEnum.YELLOW,
            text:'Mild level, these storms can cause weak fluctuations in the electrical grid and have minor impacts on satellite operations. Furthermore, at high latitudes, it is possible to observe the aurora borealis and migratory animals can be affected by these storms.'
        },
        '6': {
            color: KPColorsEnum.LIGHT_ORANGE,
            text: 'Electrical systems in high latitudes can experience voltage alarms, and in longer storms, transformers can be damaged. Ground control teams may need to adjust spacecraft orientation, and high-frequency (HF) radio propagation may disappear at higher latitudes. Additionally, the aurora borealis may be visible at lower latitudes'
        },
        '7': {
            color: KPColorsEnum.DARK_ORANGE,
            text: 'Classified as strong, corrections to the electrical grid voltage are necessary, satellite components may suffer surface charge. Low-orbit satellites may experience increased drag resistance, and satellite navigation and low-frequency radio problems may occur. HF radio propagation can also be intermittent, and the aurora borealis may be visible at intermediate latitudes.'
        }
    }

    return kpMap[Kp.toString()]
}

export function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
  
export function arrayToGraphData(dataArray, unitsAhead, timeScale, limit){
    const labels = [];
    const values = [];
    const backgrounds = [];
    let current = 0;

    for (const data of dataArray) {
        if(current > limit - 1){
            continue;
        }
        labels.push(moment(data.time).format('HH:mm'))
        values.push(data.value)
        backgrounds.push(getKpInfo(data.value).color)

        current++
    }

    if(unitsAhead > 0){
        let simulatedDate = moment(dataArray.at(-1).time);

        for (let i = 0; i < unitsAhead; i++) {
            simulatedDate = simulatedDate.add(timeScale, 'hours')
            labels.push(simulatedDate.format('HH:mm'))
            values.push(0)
            backgrounds.push(undefined)
        }
    }

    return [labels, values, backgrounds]
}
