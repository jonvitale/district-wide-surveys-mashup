import templateUrl from './sdp-footer.html'

const SdpFooterComponent = {
  template: templateUrl,
  bindings: {
      currentPage: '@',
  },
  controller: class SdpFooterComponent {
  	$onInit(){
      console.log("init", this.currentPage);
    }
  }
}

export const SdpFooterModule = angular
  .module('sdpFooter', [])
  .component('sdpFooter', SdpFooterComponent)
  .name;
