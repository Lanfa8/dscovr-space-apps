export function SobrePage(){
    return <div className="about-page">
      <h2>The problem</h2>
      <ExternalLink href="https://www.spaceappschallenge.org/2023/challenges/develop-the-oracle-of-dscovr/">Develop the Oracle of DSCOVR</ExternalLink>
      <p>Geomagnetic storms on Earth are a persistent threat to modern technologies, including GPS satellite systems and electrical power grids. These storms are caused by the interaction of Earth&apos;s magnetic field with high-speed solar wind from the Sun. Predicting these storms accurately is a formidable challenge. Even with the ability to observe solar flares and eruptions on the Sun, it remains uncertain when and how intensely these disturbances will affect Earth. This uncertainty poses significant risks to various industries, such as satellite operators, electrical utilities, and the military, which rely on stable and timely space weather forecasts.</p>
      <p><ExternalLink href="https://www.ngdc.noaa.gov/dscovr/portal/index.html">The Deep Space Climate Observatory (DSCOVR)</ExternalLink>, operated by the <ExternalLink href="https://www.ncei.noaa.gov/about-us">National Oceanic and Atmospheric Administration (NOAA)</ExternalLink>, was designed to mitigate this problem. Positioned at <ExternalLink href="https://science.nasa.gov/resource/what-is-a-lagrange-point/">Lagrange point 1</ExternalLink>, a million miles from Earth, DSCOVR measures critical parameters of the solar wind, including density, speed, temperature, and magnetic field. These measurements offer a unique vantage point, enabling early warnings of impending geomagnetic storms hours before they reach Earth.</p> 
      <p>However, DSCOVR has far exceeded its expected operational lifetime and now faces anomalies and faults that affect data quality and introduce unpredictability.</p>
      <p>One of the key objectives in addressing this challenge is to predict geomagnetic storms on Earth using the raw DSCOVR data directly as input. Currently, NOAA relies on stable, well-calibrated &aquot;level 2&aquot; data for its geomagnetic activity forecasts. The aim is to harness machine learning, specifically a neural network, to predict the <ExternalLink href="https://www.swpc.noaa.gov/products/planetary-k-index">Planetary K-index (Kp)</ExternalLink> for the next three hours based on historic DSCOVR data. Kp serves as a crucial indicator of geomagnetic storm intensity measured on earth.</p> 
      <p>The ability to forecast geomagnetic activity quickly and accurately is paramount to mitigating the impact of these storms on our technology-dependent society. Developing a predictive model that can adapt to the aging DSCOVR instrument&apos;s idiosyncrasies and provide timely Kp forecasts is a critical step toward achieving this goal.</p>
    
      <h2>The solution</h2>
      <p>Geomagnetic storms, which can wreak havoc on technologies like GPS and power grids, are difficult to forecast accurately due to the aging instruments on board of the DSCOVR satellite. To address this issue, a neural network model has been developed to predict the Planetary K-index (Kp) for the next three hours, providing valuable insights into geomagnetic activity.</p>
      <p>The neural network takes raw DSCOVR data as its input, including spectral data of solar wind particles over time. Unlike traditional forecasts that rely on well-calibrated &aquot;level 2&aquot; data, this model works directly with the raw data, allowing it to adapt to DSCOVR&apos;s aging instrument, which occasionally introduces unpredictable anomalies and faults.</p>
      <p>The neural network&apos;s architecture has been carefully designed to handle these anomalies. It incorporates anomaly detection mechanisms to identify and account for irregularities in the data.</p>
      <p>By doing so, it leverages anomalies themselves as potential indicators of space weather events. The model has been trained on historic data, aligning its predictions with the measured Planetary K-index (Kp) on earth by <ExternalLink href="https://kp.gfz-potsdam.de/en/">Helmholtz Centre Potsdam</ExternalLink>, which quantifies geomagnetic storm intensity.</p>
      <p>Crucially, this solution enables rapid and accurate forecasts, which are essential for various industries and organizations, including <ExternalLink href="https://www.swpc.noaa.gov/impacts/space-weather-and-gps-systems">GPS systems</ExternalLink>, <ExternalLink href="https://www.swpc.noaa.gov/impacts/electric-power-transmission">electrical utilities</ExternalLink>, and the <ExternalLink href="https://www.swpc.noaa.gov/impacts/satellite-communications">satellite operators</ExternalLink>.</p>
      <p>By predicting geomagnetic activity with a three-hour lead time, it empowers decision-makers to take proactive measures to safeguard their critical systems against the disruptive effects of geomagnetic storms.</p>
      <p>This innovative approach not only addresses the challenges posed by an aging instrument like DSCOVR but also highlights the potential of machine learning to extract valuable insights from noisy and unpredictable datasets. As the Sun enters its peak activity phase, making geomagnetic storms more frequent, this solution plays a vital role in enhancing our ability to predict and mitigate their impact on Earth.</p>

      <h2>The team</h2>
      <div className="the-team">
        <ExternalLink href="https://www.spaceappschallenge.org/2023/find-a-team/fubica_lovers/">Geomagnetic Web Researchers</ExternalLink>
        <div className="github-list">
          <GithubProfile 
            name="Ricardo Cenci"
            handle="RicardoCenci"
            id={53843198}
          />

          <GithubProfile 
            name="Lorenzo Menegotto"
            handle="Lorenzomene"
            id={40396841}
          />

          <GithubProfile
            name="Alan Fantin"
            handle="lanfa8"
            id={56052261}
          />

          <GithubProfile
            name="Guilherme Fracalossi"
            handle="GuilhermeFracalossi"
            id={87318329}
          />
      </div>   
    </div>   
  </div>
}

// eslint-disable-next-line react/prop-types
function GithubProfile({ name, handle, id }){
  return <div className="github-profile">
    <a href={`https://github.com/${handle}`} target="__blank" rel="noopener noreferrer">
      <img src={`https://avatars.githubusercontent.com/u/${id}?v=4`} />
      <h3>{name}</h3>
      <p>@{handle}</p>
    </a>
  </div>
}

function ExternalLink(props){
  return <a target="__blank" rel="noopener noreferrer" {...props} />
}