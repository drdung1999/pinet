const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let user_schema = new Schema({
    username: {type: String, default:"Anonymous"},
    gender: {type: String, default:"male"},
    phone_number: {type: String, default: null},
    address: {type: String, default: null},
    avatar: {type: String, default: "avatar-defult.jpg"},
    role: {type: String, default: "user"},
    class: {type: String, default: null},
    age: {type: Number, default: null},
    local: {
        name_account: String,
        email: {type: String, trim: true, default: null},
        password: String,
        is_active: {type: Boolean, default: false},
        verify_token: String,
        verify_code: String,
    },
    facebook: {
        id: String,
        token: String,
        email: {type: String, trim: true}
    },
    google: {
        id: String,
        token: String,
        email: {type: String, trim: true}
    },
    student: {
        student_code: {type: String, default: null}
    },
    created_at: {type: Number, default: Date.now},
    updated_at: {type: Number, default: null},
    deleted_at: {type: Number, default: null}
});

// create index for search
user_schema.index( { username: "text" } );

user_schema.statics = {
    create_new(email, name_account, password, token){
        return this.create({
            "local":{
                "name_account": name_account,
                "email": email,
                "password": password,
                "verify_token": token
            }
        })
    },

    find_user_by_email(email){
        return this.find({"local.email": email, "local.is_active": true}).exec();
    },

    find_user_by_account(name_account){
        return this.findOne({"local.name_account": name_account, "local.is_active": true}).exec();
    },

    find_user_by_id(user_id){
        return this.findOne(
            {"_id": user_id, "local.is_active": true},
            {"local.password": 0, "local.verify_token": 0}
            ).exec();
    },

    active_account(token){
        return this.findOneAndUpdate({"local.verify_token": token},{"local.is_active": true}).exec();
    },

    user_recover_password(email,password){
        return this.updateOne(
            {"local.email": email},
            {"local.password": password}
        )
    },

    find_by_facebook_id(facebook_id){
        return this.findOne({"facebook.id": facebook_id}).exec()
    },

    create_with_app(data){
        return this.create(data)
    },

    find_by_google_id(google_id){
        return this.findOne({"google.id": google_id}).exec()
    },

    user_upload_avatar(file_name, user_id){
        return this.updateOne(
            {'_id': user_id},
            {'avatar': file_name}
        ).exec()
    },

    user_update_informations(user_id,data_to_update){
        return this.updateOne(
            {'_id': user_id},
            data_to_update
        ).exec()
    },

    user_change_email(old_email,new_email){
        return this.updateOne(
            {'local.email': old_email},
            {'local.email': new_email}
        ).exec()
    },

    find_by_keyword(key_word){
        return this.find({
            $text: { $search: key_word}
        },{
            "username": 1,
            "address": 1,
            "gender": 1,
            "avatar": 1,
            "class": 1,
            "age": 1,
        }).sort( { score: { $meta: "textScore" } } ).exec()
    }

}


module.exports = mongoose.model('users', user_schema);

