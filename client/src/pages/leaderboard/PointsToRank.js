import imgChal from '../../images/ranks/TFT_Regalia_Challenger.png';
import imgGM from '../../images/ranks/TFT_Regalia_GrandMaster.png';
import imgMaster from '../../images/ranks/TFT_Regalia_Master.png';

function LeaguePointsComponent({ leaguePoints }) {
  let imageSource;
  
  if (leaguePoints >= 500) {
    imageSource = imgChal;
  } else if (leaguePoints >= 200) {
    imageSource = imgGM;
  } else {
    imageSource = imgMaster;
  }

  return (
    <td>
      <img src={imageSource} alt="League Icon" />
      {leaguePoints} LP
    </td>
  );
}

export default LeaguePointsComponent;