const config = {
	host: window.location.hostname,
	prefix: "/",
	port: window.location.port,
	isSecure: window.location.protocol === "https:",
	app: window.location.hostname === "localhost" ?
		"District Wide Surveys (Mashup).qvf" :"2b1e9736-e7e8-454f-8f0b-a851ed5e2494"
};

export default config;
