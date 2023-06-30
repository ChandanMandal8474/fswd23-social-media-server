const mongoose = require('mongoose');

module.exports = async ()=>{
    const mongooseUri = 'mongodb+srv://Chandan:aAHb7Avqb2uSa3ye@cluster0.msx4g.mongodb.net/?retryWrites=true&w=majority'

    try {
        const connect = await mongoose.connect(mongooseUri, 
        { 
            useNewUrlParser: true, 
            useUnifiedTopology: true
        });

        console.log(`mongodb connected : ${connect.connection.host}`);
        
    } catch (e) {
        console.log(e);
        process.exit(1);        
    }

}