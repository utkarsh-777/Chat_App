import React from "react"
import { Link } from "react-router-dom"
import {Grid,Header,Form,Segment,Icon, Button,Message} from "semantic-ui-react"
import firebase from "../../firebase"

class Login extends React.Component{
    state = {
        email:'',
        password:'',
        errors:[],
        loading:false,
    }


    handleChange = event => {
        this.setState({[event.target.name]: event.target.value})
    }

    handleSubmit = event => {
        if(this.isFormValid(this.state)){
            event.preventDefault();
            this.setState({errors:[],loading:true})
            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email,this.state.password)
                .then(signedInUser=>{
                    console.log(signedInUser)
                })
                .catch(err=>{
                    console.error(err)
                    this.setState({
                        loading:false,
                        errors:this.state.errors.concat(err)
                    })
                })
        }
    }

    isFormValid = ({email,password}) => email && password;

    handleInputError = (errors,Input) => {
        return errors.some(error=>
            error.message.toLowerCase().includes(Input)
        ) ?
            'error' : ""
    }

    displayError = errors => errors.map((error,i)=><p key={i}>{error.message}</p>)

    render(){
        const {email,password,errors,loading} = this.state
        return(
            <Grid textAlign='center' verticalAlign='middle' className='app'>
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as='h1' icon color='violet' textAlign="center">
                        <Icon name='code branch' color='violet' />
                        Login to DevChat
                    </Header>
                    <Form onSubmit={this.handleSubmit} size='large'>
                        <Segment stacked>
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
                            <Button disabled={loading} className={loading ? 'loading' : ''} color='violet' fluid size='large'>Submit</Button>
                        </Segment>
                        <Message> Don't have an Account? <Link to='/register'>Register</Link></Message>
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

export default Login;