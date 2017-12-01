
const debug = require('debug')('sparkjwt:check')

const program = require('commander')

program
    .description('displays informations contained in a JWT token')
    .option("-j, --jwt", "shows decrypted JWT info")
    .option("-s, --spark", "shows Cisco Spark API info")
    .arguments('<token>')
    .action(function (token) {

        // Check token is specified
        if (typeof token === 'undefined') {
            console.error('no token specified, exiting...');
            process.exit(1);
        }
        debug('successfully collected token')

        // Should we display raw info
        if (program.jwt) {
            debug('got it: will reveal JWT info')            
            checkJWTtoken(token)
            return
        }

        // Ask spark for info
        debug('got it: will inquire via Spark about this token')
        showSparkInfo(token)

    })
    .on('--help', function () {
        console.log('')
        console.log('  Examples:')
        console.log('')
        console.log('    $ sparkjwt check --jwt 123456789.RRETEZT3T63362.987654321')
        console.log('    $ sparkjwt check --spark 123456789.RRETEZT3T63362.987654321')
    })

program.parse(process.argv)


function checkJWTtoken(token) {

    debug('checking token')
    
    try {

        // sign with HMAC SHA256
        const jwt = require('jsonwebtoken')

        const decoded = jwt.decode(token, { complete: true })

        if (!decoded) {
            debug("decode returned null")
            console.log("the specified token does not comply with JWT format")
            process.exit(1)
        }

        debug("successfully decoded")
        console.log(decoded)
    }
    catch (err) {
        console.error("failed to decode JWT token, exiting...");
        debug("err: " + err)
        process.exit(1)
    }
}


function showSparkInfo(token) {
    debug('contacting Cisco Spark API endpoint: /people/me')
    
    const axios = require('axios');
    axios.get('https://api.ciscospark.com/v1/people/me',
    { headers: { 'Authorization': 'Bearer ' + token } })
    .then(response => {
        if (!response.data) {
            debug("unexpected response, no payload")
            console.log("could not contact Spark")
            process.exit(1)
        }
    
        console.log(response.data)
    })
    .catch(err => {
        switch (err.code) {
            case 'ENOTFOUND':
                debug("could not reach host: ENOTFOUND")
                break
            default:
                debug("error accessing /people/me, err: " + err.message)
                break
        }
        
        console.error("could not contact Cisco Spark API")
        process.exit(1);
    })   
}