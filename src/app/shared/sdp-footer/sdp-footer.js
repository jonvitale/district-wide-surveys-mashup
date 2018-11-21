import templateUrl from './sdp-footer.html'

const SdpFooterComponent = {
  template: templateUrl,
  bindings: {
      currentPage: '@',
  }
}

export const SdpFooterModule = angular
  .module('sdpFooter', [])
  .component('sdpFooter', SdpFooterComponent)
  .name;
