import config from './config';
import { AppModule } from './app.module';

let baseUrl = {
    protocol: config.isSecure ? "https://" : "http://",
    host: config.host,
    port: config.port ? `:${config.port}` : "",
    prefix: config.prefix
};
requirejs.config({
	baseUrl: `${baseUrl.protocol}${baseUrl.host}${baseUrl.port}${baseUrl.prefix}resources`
});

requirejs(['js/qlik'], qlik => {
  angular.element(document).ready( () => {
    const appModule = AppModule(qlik);
    angular.bootstrap(document, [appModule, 'qlik-angular']);
  });
});
