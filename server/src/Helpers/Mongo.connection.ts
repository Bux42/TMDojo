import * as mongoose from 'mongoose';

function connect() : void {
		mongoose.set('useNewUrlParser', true);
		mongoose.set('useCreateIndex', true);
		mongoose.set('useUnifiedTopology', true);
		mongoose.connect(process.env.MONGO_URL);
}

function connected() : Promise<void> {
	let prom : Promise<void> = new Promise((res) : void => {
		mongoose.connection.once('open', () => {
			res();
		});
	});
	return prom;
}

function close() : void {
	mongoose.connection.close();
}

export {connect, connected, close}