import React from "react"
import { Link } from "react-router-dom"
import {Grid,Header,Form,Segment,Icon, Button,Message} from "semantic-ui-react"
import firebase from "../../firebase"
import md5 from 'md5'

class Register extends React.Component{
    state = {
        username:'',
        email:'',
        password:'',
        passwordConfirmation:'',
        errors:[],
        loading:false,
        usersRef:firebase.database().ref('users')
    }

    isFormValid = () => {
        let errors = [];
        let error

        if(this.isFormEmpty(this.state)){
            error = {message:'Fill in All fields!'}
            this.setState({errors:errors.concat(error)})
            return false;
        }
        else if(!this.isPasswordValid(this.state)){
            error = {message:'Password is Invalid!'}
            this.setState({errors:errors.concat(error)})
            return false
        }
        else{
            return true
        }
    }

    isFormEmpty = ({username,email,password,passwordConfirmation}) => {
        return !username.length || !email.length || !password.length || !passwordConfirmation.length
    }

    isPasswordValid = ({password,passwordConfirmation}) => {
        if(password.length<6 || passwordConfirmation.length<6){
            return false
        }else if(password !== passwordConfirmation){
            return false
        }else{
            return true
        }
    }

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value})
    }

    handleSubmit = event => {
        if(this.isFormValid()){
        event.preventDefault();
        this.setState({error:[],loading:true})
        firebase
            .auth()
            .createUserWithEmailAndPassword(this.state.email,this.state.password)
            .then(createduser=> {
                console.log(createduser)
                createduser.user.updateProfile({
                    displayName:this.state.username,
                    photoURL:`http://gravatar.com/avatar/${md5(createduser.user.email)}?d=identicon`
                })
                .then(()=>{
                    this.saveUser(createduser).then(()=>{
                        console.log('user saved!')
                    })
                })
                .catch(err => {
                    console.error(err)
                    this.setState({loading:false,errors:this.state.errors.concat(err)})
                })
                //this.setState({loading:false})
            })
            .catch(err=>{
                console.error(err)
                this.setState({errors:this.state.errors.concat(err),loading:false})
            })
            
        }
    }

    saveUser = createdUser => {
        return this.state.usersRef.child(createdUser.user.uid).set({
            name:createdUser.user.displayName,
            avatar:createdUser.user.photoURL
        })
    }

    handleInputError = (errors,Input) => {
        return errors.some(error=>
            error.message.toLowerCase().includes(Input)
        ) ?
            'error' : ""
    }

    displayError = errors => errors.map((error,i)=><p key={i}>{error.message}</p>)

    render(){
        const {username,email,password,passwordConfirmation,errors,loading} = this.state
        return(
            <Grid textAlign='center' verticalAlign='middle' className='app'>
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as='h1' icon color='orange' textAlign="center">
                        <Icon name='puzzle piece' color='orange' />
                        Register For DevChat
                    </Header>
                    <Form onSubmit={this.handleSubmit} size='large'>
                        <Segment stacked>
                            <Form.Input fluid name='username' icon='user' iconPosition='left' 
                            placeholder='Username' onChange={this.handleChange} type='text'
                            value={username}
                            />
                            <Form.Input fluid name='email' icon='mail' iconPosition='left' 
                            placeholder='Email' onChange={this.handleChange} type='email'
                            className={this.handleInputError(errors,'email')}
                            value={email}
                            />
                            <Form.Input fluid name='password' icon='lock' iconPosition='left' 
                            placeholder='Password' onChange={this.handleChange} type='password'
                            className={this.handleInputError(errors,'password')}
                            value={password}
                            />
                            <Form.Input fluid name='passwordConfirmation' icon='repeat' iconPosition='left' 
                            placeholder='Repeat Password' onChange={this.handleChange} type='password'
                            className={this.handleInputError(errors,'password')}
                            value={passwordConfirmation}
                            />
                            <Button disabled={loading} className={loading ? 'loading' : ''} color='orange' fluid size='large'>Submit</Button>
                        </Segment>
                        <Message> Already a User? <Link to='/login'>login</Link></Message>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayError(errors)}
                        </Message>
                    )}
                </Grid.Column>
            </Grid>
        )
    }
}

export default Register;