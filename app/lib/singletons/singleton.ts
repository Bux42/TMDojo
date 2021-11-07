const Singleton = <T>(Type: { new(): T}) => {
    let instance: T | null = null;

    return {
        getInstance: () => {
            if (instance == null) {
                instance = new Type();
            }
            return instance;
        },
    };
};

export default Singleton;
