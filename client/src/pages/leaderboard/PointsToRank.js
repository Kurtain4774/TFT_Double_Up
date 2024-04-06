function LeaguePointsComponent({ leaguePoints }) {
  let imageSource;
  
  if (leaguePoints > 500) {
    imageSource = '../../images/ranks/TFT_Regalia_Challenger.png';
  } else if (leaguePoints > 200) {
    imageSource = '../../images/ranks/TFT_Regalia_GrandMaster.png';
  } else {
    imageSource = '../../images/ranks/TFT_Regalia_Master.png';
  }

  return (
    <td>
      
      <img src={imageSource} alt="League Icon" />
      {leaguePoints} LP
    </td>
  );
}

export default LeaguePointsComponent;