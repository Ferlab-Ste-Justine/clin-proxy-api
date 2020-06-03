import fs from 'fs'

//Get a secret as a standalone value
//If the secret is not defined in the path given by the first parameter, an attempt is made
//to get the secret from the environment variable defined in the second parameter
//If the secret cannot be fetched from the path or environment variable, failurecall is called
const getStandaloneSecret = (secretPath, secretEnvVar, failureCall) => {
    if(fs.existsSync(secretPath)) {
        return fs.readFileSync(secretPath, 'utf8')
    } else if( process.env[secretEnvVar] ) {
        return process.env[secretEnvVar]
    } else {
        failureCall()
    }
}

//Store a secret in the given object (using the key to determine the property to store the secret as)
//If the secret is not defined in the path given by the first parameter, the object is not modified
//If the secret cannot be fetched from the given path and is not already present on the object at 
//the given key, failureCall is called
const embedSecret = (secretPath, obj, key, failureCall) => {
    if(fs.existsSync(secretPath)) {
        obj[key] = fs.readFileSync(secretPath, 'utf8')
    } else if(!obj[key]) {
        failureCall()
    }
}

export { getStandaloneSecret, embedSecret }