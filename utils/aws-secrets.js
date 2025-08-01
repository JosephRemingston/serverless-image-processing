var {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
var dotenv = require("dotenv");
dotenv.config();
var secret_name = "serverless-media-processing";

var client = new SecretsManagerClient({
  region: "ap-southeast-1",
});

async function getSecrets() {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT",
      })
    );
    console.log(response);
    var secret = response.SecretString;
    secret = JSON.parse(secret)
    console.log(secret);
    return secret;
  } catch (error) {
    console.error(error);
  }
}
getSecrets();

module.exports = getSecrets;