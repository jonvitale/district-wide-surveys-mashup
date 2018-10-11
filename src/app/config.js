const config = {
	host: window.location.hostname,
	prefix: "/",
	port: window.location.port,
	isSecure: window.location.protocol === "https:",
	app: window.location.hostname === "localhost" ?
		"District Wide Surveys (Mashup).qvf" :"57a9feac-b7ad-45ba-a6cf-788af969e59d"
};

export default config;
