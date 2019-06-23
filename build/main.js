"use strict";
/*
 * Created with @iobroker/create-adapter v1.15.1
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
// Load your modules here, e.g.:
// import * as fs from "fs";
const molohub_1 = require("molohub");
class Molohub extends utils.Adapter {
    constructor(options = {}) {
        super(Object.assign({}, options, { name: "molohub" }));
        this.on("ready", this.onReady.bind(this));
        this.on("objectChange", this.onObjectChange.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        // this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    onReady() {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize your adapter here
            // The adapters config (in the instance object everything under the attribute "native") is accessible via
            // this.config:
            this.log.info("reverse proxy port: " + this.config.port);
            this.setState("info.connection", false, true);
            this.readObjects(this.startMolohub.bind(this));
        });
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        try {
            this.log.info("cleaned everything up...");
            callback();
        }
        catch (e) {
            callback();
        }
    }
    /**
     * Is called if a subscribed object changes
     */
    onObjectChange(id, obj) {
        if (obj) {
            // The object was changed
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        }
        else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }
    /**
     * Is called if a subscribed state changes
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        }
        else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.message" property to be set to true in io-package.json
    //  */
    // private onMessage(obj: ioBroker.Message): void {
    // 	if (typeof obj === "object" && obj.message) {
    // 		if (obj.command === "send") {
    // 			// e.g. send email or pushover or whatever
    // 			this.log.info("send command");
    // 			// Send response in callback if required
    // 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
    // 		}
    // 	}
    // }
    startMolohub() {
        if (typeof this.seed === "undefined") {
            this.client = new molohub_1.Client("150.109.43.36", 4443, "127.0.0.1", parseInt(this.config.port, 10));
        }
        else {
            this.client = new molohub_1.Client("150.109.43.36", 4443, "127.0.0.1", parseInt(this.config.port, 10), this.seed);
        }
        this.app = new molohub_1.App(this.client);
        this.client.on("newSeed", (seed) => {
            this.log.info("new seed got " + seed);
            this.setState("info.seed", seed, true);
        });
        this.client.on("newTunnel", (onlineConfig) => {
            this.log.info(`OnlineConfig: ${JSON.stringify(onlineConfig)}`);
        });
        this.client.on("updateStatus", (status) => {
            this.log.info(`Update status: ${status}`);
            if (status === "binded") {
                this.setState("info.connection", true, true);
            }
        });
        this.app.runReverseProxy();
    }
    readObjects(callback) {
        this.getState("info.seed", (err, state) => {
            if (state && state.val) {
                this.seed = state.val;
                this.log.info(`Get exist seed ${this.seed}`);
            }
            this.subscribeStates("*");
            callback && callback();
        });
    }
}
if (module.parent) {
    // Export the constructor in compact mode
    module.exports = (options) => new Molohub(options);
}
else {
    // otherwise start the instance directly
    (() => new Molohub())();
}
