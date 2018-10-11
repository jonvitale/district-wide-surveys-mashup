export const AppComponent = {
  template: `
    From AppComponent
    <home></home>
  `,
  controller: class AppComponent{
    constructor(){
      console.log("in AppComponent constructor");
    }
  }
};
