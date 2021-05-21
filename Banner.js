class Banner extends React.Component {
    constructor(){
        super(props);
        this.state = {
            name: '',
            appVersion: ''
        }
    }

    render(){
        return(
            <>
                <h2>Hello Friend! Welcome back.</h2>
                <button>Download Button</button>
            </>
        )
    }
}