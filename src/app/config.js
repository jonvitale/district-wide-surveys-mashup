// note, there are two apps on QAP, one for testing one for public
// testing: 038e3df0-7869-493f-86ac-9cabcafa6c2c
// public: "2b1e9736-e7e8-454f-8f0b-a851ed5e2494"

const config = {
	host: window.location.hostname,
	prefix: "/",
	port: window.location.port,
	isSecure: window.location.protocol === "https:",
	app: window.location.hostname === "localhost" ?
		"District Wide Surveys (Mashup) [v1.1.0] (JV).qvf" : "2b1e9736-e7e8-454f-8f0b-a851ed5e2494" //"2b1e9736-e7e8-454f-8f0b-a851ed5e2494"
};

export default config;
