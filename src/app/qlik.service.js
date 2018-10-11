/// NOT WORKING

export class QlikService {
  constructor(qlik, config){
    this.qlik = qlik;
    this.openApp = qlik.openApp(config.app, config);
    console.log("in QlikService constructor", qlik, config)
  }
}
