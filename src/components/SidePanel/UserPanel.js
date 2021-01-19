import React from "react";
import {Button, Dropdown, Grid, Header, Icon,Image,Input,Modal} from "semantic-ui-react";
import firebase from "../../firebase";
import AvatarEditor from "react-avatar-editor";

class UserPanel extends React.Component{
    state={
        user:this.props.currentUser,
        modal:false,
        previewImage:'',
        croppedImage:"",
        uploadedCroppedImage:'',
        blob:'',
        storageRef:firebase.storage().ref(),
        userRef:firebase.auth().currentUser,
        usersRef:firebase.database().ref('users'),
        metadata:{
            contentType:'image/jpeg'
        }
    }

    dropDownUser = () => [
        {
            key:"user",
            text: <span>Signed in As <strong>{this.state.user.displayName}</strong></span>,
            disabled: true
        },
        {
            key:'avatar',
            text: <span onClick={this.openModal}>Change Avatar</span>
        },
        {
            key:'signout',
            text: <span onClick={this.handleSignout}>Sign Out</span>
        }
    ]

    uploadCroppedImage = () => {
        const { storageRef,userRef,blob,metadata } = this.state;
        storageRef  
            .child(`avatars/users/${userRef.uid}`)
            .put(blob,metadata)
            .then(snap => {
                snap.ref.getDownloadURL().then(downloadURL => {
                    this.setState({ uploadedCroppedImage:downloadURL }, () => {
                        this.changeAvatar();
                    })
                })
            })
    }

    changeAvatar = () => {
        this.state.userRef
            .updateProfile({
                photoURL:this.state.uploadedCroppedImage
            })
            .then(() => {
                console.log('PhotoURL updated!');
                this.closeModal();
            })
            .catch(err => console.error(err))

            this.state.usersRef
                .child(this.state.user.uid)
                .update({avatar:this.state.uploadedCroppedImage})
                .then(()=>{
                    console.log('User Avatar Updated Successfully!');
                })
                .catch(err => {
                    console.error(err);
                })
    }

    handleSignout = () => {
        firebase
            .auth()
            .signOut()
            .then(()=>console.log("Signed out!"))
    }

    openModal = () => this.setState({modal:true});

    closeModal = () => this.setState({modal:false});

    handleChange = event => {
        const file = event.target.files[0];
        const reader = new FileReader();

        if(file) {
            reader.readAsDataURL(file);
            reader.addEventListener('load', () => {
                this.setState({previewImage:reader.result});
            })
        }
    }

    handleCropImage = () => {
        if(this.avatarEditor) {
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
                let imageURL = URL.createObjectURL(blob);
                this.setState({
                    croppedImage: imageURL,
                    blob
                })
            })
        }
    }

    render() {
        const {user,modal,previewImage,croppedImage} = this.state;
        const {primaryColor} = this.props;
        return(
            <Grid style={{background:primaryColor}}>
                <Grid.Column>
                    <Grid.Row style={{padding:'1.2em',margin:0}}>
                        <Header inverted floated='left' as='h2'>
                            <Icon name='code' />
                            <Header.Content>DevChat</Header.Content>
                        </Header>
                        <Header style={{padding:'0.25em'}} as='h4' inverted>
                        <Dropdown trigger={
                            <span>
                                <Image src={user.photoURL} spaced='right' avatar />
                                {user.displayName}
                            </span>
                        } options={this.dropDownUser()} />
                        </Header>
                    </Grid.Row>
                    {/* Change user avatar modal */}
                    <Modal basic open={modal} onClose={this.closeModal}>
                        <Modal.Header>
                            Change Avatar
                        </Modal.Header>
                        <Modal.Content>
                            <Input 
                                fluid
                                type='file'
                                label="New Avatar"
                                name="previewImage"
                                onChange={this.handleChange}
                            />
                            <Grid centered stackable columns={2}>
                                <Grid.Row centered>
                                    <Grid.Column className='ui center aligned grid'>
                                        {previewImage &&
                                            <AvatarEditor 
                                                ref={node => (this.avatarEditor = node)}
                                                image={previewImage}
                                                width={120}
                                                height={120}
                                                border={50}
                                                scale={1.2}
                                            />
                                        }
                                    </Grid.Column>
                                    <Grid.Column>
                                        {croppedImage && (
                                            <Image 
                                                style={{margin: '3.5em auto'}}
                                                width={100}
                                                height={100}
                                                src={croppedImage}
                                            />
                                        )}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            {croppedImage && <Button inverted color='green' onClick={this.uploadCroppedImage}>
                                <Icon avatar name='save' /> Change Avatar
                            </Button>}
                            <Button inverted color='yellow' onClick={this.handleCropImage}>
                                <Icon avatar name='image' /> Preview
                            </Button>
                            <Button inverted color='red' onClick={this.closeModal}>
                                <Icon avatar name='remove' /> Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </Grid.Column>
            </Grid>
        )
    }
}


export default UserPanel;