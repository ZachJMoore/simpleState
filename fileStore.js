const fs = require("fs");
var path = require('path');
const jetpack = require("fs-jetpack");
ROOT_APP_PATH = fs.realpathSync('.');

class Base {


    constructor(props){

        let fullPath = null
        let root = ROOT_APP_PATH

        if (props.absolutePath){
            fullPath = props.absolutePath
        } else if (props.relPath){
            fullPath = path.join(root, props.relPath)
        }

        if (!fullPath) fullPath = ""

        this.directory = jetpack.cwd(fullPath)

    }

    set(data, fileName = "state", atomic = false){
        this.directory.write(`${fileName}.json`, data, {
            atomic
        })
    }

    get(fileName = "state"){
        let data = this.directory.read(`${fileName}.json`, "json")
        if (!data) data = null
        return data
    }

}

module.exports = Base