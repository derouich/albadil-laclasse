require('dotenv').config();

module.exports = {
    PORT: process.env.PORT,

    DB_DIALECT: process.env.DB_DIALECT,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,

    JWT_ENCRYPTION: process.env.JWT_ENCRYPTION,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION,

    BBB_HOST: process.env.BBB_HOST,
    BBB_SECRET: process.env.BBB_SECRET,
    BBB_END_CALLBACK_URL: process.env.BBB_END_CALLBACK_URL,
    BBB_MEETING_WELCOME_MESSAGE: process.env.BBB_MEETING_WELCOME_MESSAGE,
    BBB_MEETING_PRESENTATION_URL: process.env.BBB_MEETING_PRESENTATION_URL,
    BBB_MEETING_PRESENTATION_NAME: process.env.BBB_MEETING_PRESENTATION_NAME,

    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,

    DASHBOARD_URL: process.env.DASHBOARD_URL,
    API_URL: process.env.API_URL,

    USERS: [
        {
            fullName: 'Teacher Test',
            email: 'teacher@laclasse.ma',
            phone: '0000000000',
            password: '12345678',
            cityName: 'Marrakech',
            etablissement: 'Test School',
            isModerator: true
        },
        {
            fullName: 'Student Test',
            email: 'student@laclasse.ma',
            phone: '1111111111',
            password: '12345678',
            cityName: 'Marrakech',
            etablissement: 'Test School',
            isModerator: false
        },
        {
            fullName: 'Admin ',
            email: 'admin@laclasse.ma',
            phone: '1111111111',
            password: '12345678',
            cityName: 'Marrakech',
            etablissement: 'Test School',
            isModerator: true,
            isAdmin: true
        }
    ],

    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY
};
