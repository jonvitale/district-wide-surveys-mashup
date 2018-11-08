import templateUrl from './sdp-footer.html'

const SdpFooterComponent = {
  template: templateUrl,
  bindings: {
      currentPage: '@',
  },
  controller: class SdpFooterComponent {
  }
}

export const SdpFooterModule = angular
  .module('sdpFooter', [])
  .component('sdpFooter', SdpFooterComponent)
  .name;
