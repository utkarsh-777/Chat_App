import React from "react";
import {Segment,Button,Input} from "semantic-ui-react";
import firebase from "../../firebase";
import FileModal from "./FileModal";
import { v4 as uuidv4 } from 'uuid';
import ProgressBar from "./ProgressBar";
import { emojiIndex,Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

class MessageForm extends React.Component{
    state={
        message:'',
        loading:false,
        channel:this.props.currentChannel,
        user:this.props.currentUser,
        errors:[],
        messagesRef:firebase.database().ref('messages'),
        modal:false,
        uploadState:'',
        uploadTask:null,
        storageRef:firebase.storage().ref(),
        typingRef:firebase.database().ref('typing'),
        percentUploaded:0,
        emojiPicker:false
    }

    componentWillUnmount() {
        if(this.state.uploadTask !== null) {
            this.state.uploadTask.cancel();
            this.setState({ uploadTask:null });
        }
    }

    handleChange = event => {
        this.setState({[event.target.name]:event.target.value});
    }

    handleKeyDown = event => {
        if(event.ctrlKey && event.keyCode === 13) {
            this.sendMessage();
        }

        const { message,typingRef,channel,user } = this.state;
        if(message){
            typingRef
                .child(channel.id)
                .child(user.uid)
                .set(user.displayName);
        } else {
            typingRef
                .child(channel.id)
                .child(user.uid)
                .remove();
        }
    }

    handleTogglePicker = () => {
        this.setState({emojiPicker: !this.state.emojiPicker})
    }

    handleAddEmoji = emoji => {
        const oldMessage = this.state.message;
        const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} ` );
        this.setState({message:newMessage,emojiPicker:false});
        setTimeout(() => this.messageInputRef.focus(), 0);
    }

    colonToUnicode = message => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
            x=x.replace(/:/g, "");
            let emoji = emojiIndex.emojis[x];
            if(typeof emoji !== undefined) {
                let unicode = emoji.native;
                if(typeof emoji !== undefined) {
                    return unicode
                }
            }
            x = ":" + x + ":";
            return x
        });
    };

    createMessage = (fileUrl=null) => {
        const message = {
            timestamp:firebase.database.ServerValue.TIMESTAMP,
            user:{
                id:this.state.user.uid,
                name:this.state.user.displayName,
                avatar:this.state.user.photoURL
            }, 
        }
        if(fileUrl!==null){
            message['image'] = fileUrl
        } else {
            message['content'] = this.state.message
        }

        return message
    }

    sendMessage = () => {
        const {getMessagesRef} = this.props;
        const {message,channel,user,typingRef} = this.state;
        console.log(getMessagesRef())
        if(message){
            this.setState({loading:true})
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(()=>{
                    this.setState({loading:false,message:'',errors:[]});
                    typingRef
                        .child(channel.id)
                        .child(user.uid)
                        .remove();
                })
                .catch(err=>{
                    console.error(err);
                    this.setState({loading:false,errors:this.state.errors.concat(err)})
                })
        }else{
            this.setState({
                errors:this.state.errors.concat({message:"Add a message!"})
            })
        }
    }

    openModal = () => this.setState({modal:true})

    closeModal = () => this.setState({modal:false})

    getPath = () => {
        if(this.props.isPrivateChannel){
            return `chat/private/${this.state.channel.id}`;
        } else {
            return 'chat/public';
        }
    }

    uploadFile = (file,metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuidv4()}`;

        this.setState({
            uploadState:'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file,metadata)
        },
        () => {
            this.state.uploadTask.on('state_changed',snap => {
            const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
            this.setState({percentUploaded})
            },
            err => {
                this.setState({
                    errors:this.state.errors.concat(err),
                    uploadState:'error',
                    uploadTask:null
                })
            },
            () => {
                this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl=>{
                    this.sendFileMessage(downloadUrl,ref,pathToUpload);
                })
                .catch(err=>{
                    console.error(err);
                    this.setState({
                        errors:this.state.errors.concat(err),
                        uploadState:'error',
                        uploadTask:null
                    })
                })
              }
            )
        }
    )
}

    sendFileMessage = (fileUrl,ref,pathToUpload) => {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(()=>{
                this.setState({uploadState:'done'})
            })
            .catch(err=>{
                console.error(err);
                this.setState({
                    errors:this.state.errors.concat(err)
                })
            })
    }

    render(){   
        const {errors,message,loading,modal,uploadState,percentUploaded,emojiPicker} = this.state;
        return(
            <Segment className="message__form">
                {emojiPicker && (
                    <Picker 
                        onSelect={this.handleAddEmoji}
                        set="apple"
                        className="emojipicker"
                        title="Pick Your Emoji"
                        emoji="point_up"
                    />
                )}
                <Input 
                    onKeyDown={this.handleKeyDown}
                    fluid
                    name="message"
                    style={{marginBottom:"0.7em"}}
                    label={
                        <Button 
                            icon={emojiPicker ? "close" : "add"} 
                            content={emojiPicker ? "Close" : null}
                            onClick={this.handleTogglePicker} 
                        />}
                    labelPosition='left'
                    placeholder="Write Your Message"
                    onChange={this.handleChange}
                    value={message}
                    ref={node => this.messageInputRef = node}
                    className={
                        errors.some(error => error.message.includes('message')) 
                        ? 'error' 
                        : ""
                    }
                />
                <Button.Group icon widths="2">
                    <Button 
                     color="orange"
                     content="Add Reply"
                     labelPosition="left"
                     disabled={loading}
                     icon="edit"
                     onClick={this.sendMessage}
                    />
                    <Button 
                     disabled={uploadState==='uploading'}
                     onClick={this.openModal}
                     color="teal"
                     content="Upload Media"
                     labelPosition="right"
                     icon="cloud upload"
                    />    
                </Button.Group>
                <FileModal 
                    uploadFile={this.uploadFile}
                    modal={modal}
                    closeModal={this.closeModal}
                />
                <ProgressBar 
                    uploadState={uploadState}
                    percentUploaded={percentUploaded}
                />
            </Segment>
        )
    }
}

export default MessageForm;