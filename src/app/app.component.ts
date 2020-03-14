import { Component, OnInit, ElementRef } from '@angular/core';
import { question } from '../question';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  questions: question[] = [];
  listUrl = environment.questionsListUrl;
  quizs = ['html', 'javascript'];
  quizStep: boolean = false;
  userDetailsStep: boolean = false;
  quizResultStep: boolean = false;
  username: string = '';
  quizCategory: string = null;
  currentIndex: number = 0;
  singleQuestion: question;
  answerBtnPress: boolean = false;
  answersList: any[] = [];
  lastScore: Number;
  lastScoreGrade: string;

  constructor(private http: HttpClient, private el: ElementRef) {}

  ngOnInit() {
    this.resetQuiz();
  }
  userDetails = new FormGroup({
    userName: new FormControl('', Validators.required),
    selectQuiz: new FormControl('', Validators.required)
  });
  startQuiz() {
    this.userDetailsStep = false;
    this.username = this.userDetails.get('userName').value;
    this.quizCategory = this.userDetails.get('selectQuiz').value;
    this.quizStep = true;
    if (this.quizCategory != null) {
      const url = `${this.listUrl}`;
      this.http.get<question>(url)
        .subscribe(data => {
          const shuffleQuestions = this.sortingQuestions(data['questions'][this.quizCategory]);
          shuffleQuestions.forEach(question => {
            this.questions.push(question);
          });
          if(this.questions.length > 0) {
            this.setQuestion(this.currentIndex);
          }
        });
    }
  }
  setQuestion(i) {
    this.singleQuestion = this.questions[i];
    if(this.questions.length - 1 == this.currentIndex) {
      this.el.nativeElement.querySelector('.next-btn').textContent = "Submit Answers"
    }
    this.answersList.push({
      id: this.singleQuestion.id,
      isCorrect: null,
      pressedAnswer: null
    });
  }
  sortingQuestions(list) {
    return list.sort(() => Math.random() - 0.5);
  }
  resetQuiz() {
    this.quizResultStep = false;
    this.userDetailsStep = true;
    this.currentIndex = 0;
    this.singleQuestion = null;
    this.answersList = [];
    this.lastScore = 0;
    this.lastScoreGrade = '';
    this.questions = [];
  }
  answerPressed(e,answer, answerIndex) {
    const btns = this.el.nativeElement.querySelectorAll('.btn-answer');
    btns.forEach(btn => {
      if(btn.classList.contains('selected-answer')) {
        btn.classList.remove('selected-answer');
      }
    });
    this.answerBtnPress = true;
    e.target.classList.add('selected-answer');
    this.answersList[this.currentIndex].isCorrect = answer.isAnswer;
    this.answersList[this.currentIndex].pressedAnswer = answerIndex;
  }
  nextQuestion() {
    this.answerBtnPress = false;
    this.currentIndex++;
    if((this.questions.length - 1) >= this.currentIndex) {
      this.setQuestion(this.currentIndex);
    } else {
      this.quizStep = false;
      this.quizResultStep = true;
      this.currentIndex = 0;
      this.calcScore();
    }
  }
  get getProgress() {
    return (this.currentIndex * 100) / (this.questions.length - 1);  
  }
  calcScore() {
    let correctAnswers = 0;
    this.answersList.forEach(answer => {
      if(answer.isCorrect) {
        correctAnswers++ 
      }
    });
    this.lastScore = (correctAnswers*100)/this.questions.length;
    if(this.lastScore <= 40) {
      this.lastScoreGrade = "Poor";
    } else if(this.lastScore > 40 && this.lastScore <= 70) {
      this.lastScoreGrade = "Average";
    } else {
      this.lastScoreGrade = "Good";
    }
  }
  retry() {
    this.quizResultStep = false;
    this.quizStep = true;
  }
}
