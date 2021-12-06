# CSYE6225 - Assignment 1

# Technology 
- Node
- Express
- MySql

# Tools Used
- VS Code
- Postman
  
# Steps to create a project
1. Open VS code terminal and create a directory assignment1 
2. Under newly created directory. Do npm init and mention name as "assignment1", entry point as "server.js" to create a project folder structure
3. Install express,mysql and body-parser using npm install express mysql body-parser --save command
4. Connect to mysql database and set the password under db config file
5. Also, install moment for setting date value, uuid for generating id, password-validator and email-validator to validate the user inputs, bcrypt for hashing the password

# Steps to run the project
1. npm install will install all the required modules
2. Make sure to run node server.js under assignment1 folder
3. Once, you see console log saying db connected and listening to port no. REST api can be tested on the specified port no
4. For the Post request, set the method POST, url : localhost:{portno}/user and under body give the parameters {first_name, last_name, password, username} 
5. Verify that id,account_created and account_updated fields are generated, password is not displayed
6. For GET and PUT request, enter the username and password of the User set in the DB under Authorization tab using type Basic Auth.

# Steps to run Unit test cases
1. Create a test folder and a test file.
2. Verify chai, chai-http, mocha are installed.
3. Add debug configuration and attach a process and verify the program details else change it to server.js
4. Under package.json, under test tag change it mocha
5. After adding the test cases, run npm test and verify if use cases are passing

# Create SSL certificate and import in aws
1. Generate CSR code
2. Purchase SSL certificate
3. Activate certificate by pasting CSR code
4. Add CNAME record in aws route 53
5. Once the certificate is activated, download the package
6. Run aws cli command to import certificate, private key and ca cert chain
   $ aws acm-pca import-certificate-authority-certificate \
--certificate-authority-arn arn:aws:acm-pca:region:account:\
certificate-authority/12345678-1234-1234-1234-123456789012 \
--certificate file://C:\example_ca_cert.pem \
--certificate-chain file://C:\example_ca_cert_chain.pem 
