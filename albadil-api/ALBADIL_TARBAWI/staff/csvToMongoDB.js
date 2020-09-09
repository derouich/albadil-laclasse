const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const { User } = require('../../models');
const { to } = require('../../helpers/utils');


fs.createReadStream(path.resolve(__dirname, 'staffs.csv'))
    .pipe(csv.parse({
        delimiter: ','
    }))
    .on('error', error => console.error(error))


    .on('data', async row => {
        let userData = {
            studentNumber: row[0],
            fullName: row[1],
            email: row[2],
            password: row[3],
            etablissement: row[4],
			isAdmin: true,
			isModerator: true
        };

        let err, user;
        [err, user] = await to(User.findOne({email: userData.email}));
        if (err) console.log(err);

        if (!user) {
            [err, user] = await to(User.create(userData));
            if (err) {
                console.log(err);
            }
        } else {
            console.log(userData.email);
        }
    })


    .on('end', rowCount => {
        console.log(`Parsed ${rowCount} rows`);
    });
