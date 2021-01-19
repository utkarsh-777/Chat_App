import React from "react";
import {Menu,Icon} from "semantic-ui-react";
import { connect } from "react-redux";
import { setCurrentChannel,setPrivateChannel } from "../../actions";
import firebase from "../../firebase";

class Starred extends React.Component {
    state = {
        user:this.props.currentUser,
        usersRef: firebase.database().ref('users'),
        starredChannels: [],
        activeChannel: ''
    }

    componentDidMount() {
        if(this.state.user){
            this.addListener(this.state.user.uid);
        }
    }

    componentWillUnmount() {
        this.removeListener();
    }

    removeListener = () => {
        this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
    };

    addListener = userId => {
        this.state.usersRef
            .child(userId)
            .child('starred')
            .on('child_added', snap => {
                const starredChannel =  {id: snap.key, ...snap.val() };
                this.setState({
                    starredChannels: [...this.state.starredChannels, starredChannel]
                });
            });

        this.state.usersRef
            .child(userId)
            .child('starred')
            .on('child_removed',snap => {
                const channelToRemove = { id: snap.key, ...snap.val() };
                const filteredChannels = this.state.starredChannels.filter(channel=>{
                    return channel.id !== channelToRemove.id;
                });
                this.setState({ starredChannels: filteredChannels })
            })
    }

    setActiveChannel = channel => {
        this.setState({activeChannel:channel.id})
    }

    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
    }

    displayChannels = starredChannels => 
        starredChannels.length>0 && 
        starredChannels.map(channel=>(
            <Menu.Item
                key={channel.id}
                onClick={()=>this.changeChannel(channel)}
                name={channel.name}
                style={{opacity:0.7}}
                active={channel.id === this.state.activeChannel}
            >
            # {channel.name}
            </Menu.Item>
        ))

    render() {
        const {starredChannels} = this.state; 
        console.log(starredChannels)
        return(
            <Menu.Menu className='menu'>
                <Menu.Item>
                    <span>
                        <Icon name='star'/> STARRED
                    </span> {" "}
                    ({starredChannels.length}) 
                    {/*channels*/}
                </Menu.Item>
                {this.displayChannels(starredChannels)}
            </Menu.Menu>
        )
    }
}

export default connect(null,{setPrivateChannel,setCurrentChannel})(Starred);