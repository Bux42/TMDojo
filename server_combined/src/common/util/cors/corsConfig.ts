export const corsConfig = {
    origin: [
        'http://localhost:4200', // local UI dev environment
        'http://localhost:3000', // local UI dev environment
        'https://tmdojo.com', // live UI
        /https:\/\/tm-dojo-.*\.vercel\.app/, // Vercel preview environments
    ],
    credentials: true,
};
