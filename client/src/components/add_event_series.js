import React from "react";

export default class AddEventSeries extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: '',
            answerText: '',
            answerTextError: ''
        }
        this.updateAnswerText = this.updateAnswerText.bind(this);
        this.submitAnswer = this.submitAnswer.bind(this);
    }

    updateAnswerText(e) {this.setState({answerText: e.target.value})}

    submitAnswer(question) {
        let acceptable = true;
        const answer = this.state.answerText; 
        if (answer == "") {
            this.setState({ answerTextError: "Please enter an answer" });
            acceptable = false;
        } else {
            this.setState({ answerTextError: "" });
        }
        if (!acceptable) { return; }
    }

    render() {
        return (
            <div id = "add_event_series">
                <h1> Add Event Series: {this.state.type} </h1>
                <div>
                    <h2> Answer Text* </h2>
                    <textarea id = "AnswerText" type = "text" onChange={this.updateAnswerText}></textarea>
                    <p id = "answerTextError" className = "error">{this.state.answerTextError}</p>
                </div>
                <div className = "submit_div" >
                    <button className = "event_series_button" onClick={() => this.submitAnswer(this.props.question)}>Submit Answer</button>
                    <p className = "error"> * indicates mandatory fields </p>
                </div>
            </div>
        ); 
    }
}