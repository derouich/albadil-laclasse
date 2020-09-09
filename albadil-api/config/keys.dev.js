require('dotenv').config();

module.exports = {
    PORT: 8081,

    DB_DIALECT: 'mongo',
    DB_HOST: 'localhost',
    DB_PORT: '27017',
    DB_NAME: 'albadil',
    DB_USER: 'root',
    DB_PASSWORD: 'root',

    JWT_ENCRYPTION: 'GNzwEJZ]N,PdJ8+AJ@^bnVJUi>8:^tKX',
    JWT_EXPIRATION: '10000',

    BBB_HOST:'https://live1.laclasse.ma/bigbluebutton/api',
    BBB_SECRET:'6bfjhZbcsL3uIVvarmylphC90VP319ibPjCrTZi98',
    BBB_END_CALLBACK_URL: 'http://localhost:8081/v1/room/logout',
    BBB_MEETING_WELCOME_MESSAGE: 'Bienvenue au CityParcours.',

    BBB_MEETING_PRESENTATION_URL: 'https://bucket.mwsapp.com/cityparcours-users-profile-pictures/cityparcourspres.pdf',
    BBB_MEETING_PRESENTATION_NAME: 'default.pdf',
    SMTP_USER: 'noreply@gustaveeiffel.ma',
    SMTP_PASS: 'HyK65@9Z',

    DASHBOARD_URL: 'http://localhost:8082',
    API_URL: 'http://localhost:8081',

    USERS: [
        {
            fullName: 'Teacher Test',
            email: 'teacher@laclasse.ma',
            phone: '0000000000',
            password: '12345678',
            cityName: 'Agadir',
            etablissement: 'Test School',
            isModerator: true
        },
        {
            fullName: 'Student Test',
            email: 'student@laclasse.ma',
            phone: '1111111111',
            password: '12345678',
            cityName: 'Agadir',
            etablissement: 'Test School',
            isModerator: false
        }
    ],

    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY
};
