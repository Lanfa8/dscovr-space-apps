import moment from "moment";
import { KPColorsEnum } from "./enums/KPColorsEnum";

export function getKpInfo(Kp){
    if(Kp < 5){
      return {
        color: KPColorsEnum.GREEN,
        text: 'Sem tempestade'
      };
    }
    
    if(Kp > 7){
        return {
            color: KPColorsEnum.RED,
            text: 'Nível severo de tempestade geomagnética, com possíveis problemas generalizados de controle de voltagem e sistemas de proteção que podem desligar ativos-chave da rede elétrica erroneamente. Há também o risco de carga superficial e problemas de rastreamento em satélites. Correntes induzidas em dutos podem afetar medidas preventivas, e a propagação de rádio HF pode ser esporádica. A navegação por satélite e o rádio de baixa frequência também podem ser prejudicados, com a aurora boreal visível em latitudes mais baixas.'
        }
    }

    const kpMap = {
        '5': {
            color: KPColorsEnum.YELLOW,
            text:'Nível leve, essas tempestades podem causar flutuações fracas na rede elétrica e ter impactos menores nas operações de satélites. Além disso, em latitudes elevadas, é possível observar a aurora boreal e animais migratórios podem ser afetados por essas tempestades.'
        },
        '6': {
            color: KPColorsEnum.LIGHT_ORANGE,
            text: 'Sistemas elétricos em latitudes elevadas podem enfrentar alarmes de voltagem e, em tempestades mais longas, transformadores podem ser danificados. As equipes de controle em terra podem precisar ajustar a orientação de espaçonaves, e a propagação de rádio de alta frequência (HF) pode desaparecer em latitudes mais altas. Além disso, a aurora boreal pode ser visível em latitudes mais baixas'
        },
        '7': {
            color: KPColorsEnum.DARK_ORANGE,
            text: 'Classificadas como forte, são necessárias correções na voltagem da rede eletrica, componentes de satélites podem sofrer carga superficial. Satélites em órbita baixa podem enfrentar aumento na resistência do arrasto, e problemas de navegação por satélite e rádio de baixa frequência podem ocorrer. A propagação de rádio HF também pode ser intermitente, e a aurora boreal pode ser visível em latitudes intermediárias.'
        }
    }

    return kpMap[Kp.toString()]
}

export function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
  
export function arrayToGraphData(dataArray, unitsAhead, timeScale){
    const labels = [];
    const values = [];
    const backgrounds = [];

    for (const data of dataArray) {
        labels.push(moment(data.time).format('HH:mm'))
        values.push(data.value)
        backgrounds.push(getKpInfo(data.value).color)
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
