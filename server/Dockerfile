FROM public.ecr.aws/lambda/nodejs:14

COPY package.json ./

RUN npm install

COPY . .
RUN npm run build

EXPOSE 80

CMD [ "dist/serverlessApp.handler" ]