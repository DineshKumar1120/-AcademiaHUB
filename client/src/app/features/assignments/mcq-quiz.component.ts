import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AssignmentService } from '../../core/services/assignment.service';
import { SubmissionService } from '../../core/services/submission.service';
import { ToastService } from '../../core/services/toast.service';
import { Assignment, MCQQuestion } from '../../core/models/assignment.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-mcq-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container-fluid p-0 fade-in" style="max-width: 900px;">
      <app-loading-spinner *ngIf="loading" message="Loading MCQ Quiz exam..."></app-loading-spinner>

      <div *ngIf="!loading && assignment">
        <!-- Timer & Header Bar -->
        <div class="card card-custom p-3 mb-4 bg-white border-top border-4 border-primary">
          <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <span class="badge bg-primary me-2">MCQ QUIZ EXAM</span>
              <h4 class="fw-bold text-dark mb-0 d-inline align-middle">{{ assignment.title }}</h4>
            </div>

            <!-- Countdown Timer Box -->
            <div class="bg-dark text-white rounded-3 px-3 py-2 text-center d-flex align-items-center gap-2">
              <i class="bi bi-clock-history text-warning fs-5"></i>
              <div>
                <div class="extra-small text-white-50 leading-none">TIME REMAINING</div>
                <div class="fw-bold fs-5 tracking-widest text-warning">{{ formatTime(secondsRemaining) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4" *ngIf="questions.length > 0">
          <!-- Question Palette Sidebar -->
          <div class="col-12 col-md-4">
            <div class="card card-custom p-3 mb-3">
              <h6 class="fw-bold text-dark mb-3"><i class="bi bi-grid me-1"></i> Question Navigator</h6>
              <div class="d-flex flex-wrap gap-2">
                <button
                  *ngFor="let q of questions; let idx = index"
                  class="btn btn-sm rounded-circle fw-bold position-relative"
                  [ngClass]="getQuestionBtnClass(idx)"
                  style="width: 40px; height: 40px;"
                  (click)="currentQuestionIndex = idx"
                >
                  {{ idx + 1 }}
                </button>
              </div>
              <div class="border-top pt-3 mt-3 extra-small text-muted d-flex justify-content-between">
                <span><i class="bi bi-circle-fill text-success me-1"></i> Answered</span>
                <span><i class="bi bi-circle-fill text-secondary me-1"></i> Unanswered</span>
              </div>
            </div>

            <button class="btn btn-gradient w-100 py-2 fw-bold" (click)="confirmSubmit()">
              <i class="bi bi-send me-1"></i> Finalize & Submit Quiz
            </button>
          </div>

          <!-- Active Question Box -->
          <div class="col-12 col-md-8">
            <div class="card card-custom p-4 p-md-5 h-100 d-flex flex-column" *ngIf="currentQuestion">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="fw-bold text-primary">Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</span>
                <span class="badge bg-light text-dark border">{{ currentQuestion.marks }} Marks</span>
              </div>

              <h5 class="fw-bold text-dark mb-4">{{ currentQuestion.questionText }}</h5>

              <!-- Radio Options -->
              <div class="d-grid gap-3 mb-4 flex-grow-1">
                <label
                  *ngFor="let opt of currentQuestion.options"
                  class="p-3 rounded-3 border d-flex align-items-center gap-3 cursor-pointer transition-all"
                  [ngClass]="selectedAnswers[currentQuestion._id] === opt.optionLetter ? 'border-primary bg-primary-subtle' : 'bg-white hover-bg-light'"
                >
                  <input
                    type="radio"
                    class="form-check-input flex-shrink-0"
                    [name]="'question_' + currentQuestion._id"
                    [value]="opt.optionLetter"
                    [(ngModel)]="selectedAnswers[currentQuestion._id]"
                  />
                  <div class="fw-bold text-primary small">{{ opt.optionLetter }}.</div>
                  <div class="text-dark small flex-grow-1">{{ opt.optionText }}</div>
                </label>
              </div>

              <!-- Navigation Controls -->
              <div class="d-flex justify-content-between border-top pt-3">
                <button
                  class="btn btn-outline-secondary btn-sm"
                  [disabled]="currentQuestionIndex === 0"
                  (click)="currentQuestionIndex = currentQuestionIndex - 1"
                >
                  <i class="bi bi-chevron-left me-1"></i> Previous
                </button>

                <button
                  class="btn btn-primary-custom btn-sm"
                  [disabled]="currentQuestionIndex === questions.length - 1"
                  (click)="currentQuestionIndex = currentQuestionIndex + 1"
                >
                  Next <i class="bi bi-chevron-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MCQQuizComponent implements OnInit, OnDestroy {
  assignmentId = '';
  assignment: Assignment | null = null;
  questions: MCQQuestion[] = [];
  currentQuestionIndex = 0;
  selectedAnswers: { [questionId: string]: string } = {};

  secondsRemaining = 1800; // 30 mins default
  timerInterval: any = null;
  loading = true;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private submissionService: SubmissionService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.assignmentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.assignmentId) this.loadQuiz();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  loadQuiz() {
    this.loading = true;
    this.assignmentService.getAssignmentById(this.assignmentId).subscribe({
      next: (res) => {
        this.assignment = res.assignment;
        if (res.assignment.timeLimitMinutes) {
          this.secondsRemaining = res.assignment.timeLimitMinutes * 60;
        }
        this.startTimer();

        this.assignmentService.getAssignmentQuestions(this.assignmentId).subscribe({
          next: (qRes) => {
            this.questions = qRes.questions;
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get currentQuestion(): MCQQuestion | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.secondsRemaining > 0) {
        this.secondsRemaining--;
      } else {
        clearInterval(this.timerInterval);
        this.toast.warning('Time expired! Automatically submitting your answers.');
        this.submitQuiz();
      }
    }, 1000);
  }

  formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getQuestionBtnClass(idx: number): string {
    const qId = this.questions[idx]?._id;
    const isCurrent = idx === this.currentQuestionIndex;
    const isAnswered = !!this.selectedAnswers[qId];

    if (isCurrent) return 'btn-primary shadow';
    if (isAnswered) return 'btn-success text-white';
    return 'btn-outline-secondary';
  }

  confirmSubmit() {
    if (confirm('Are you sure you want to finalize and submit your quiz exam?')) {
      this.submitQuiz();
    }
  }

  submitQuiz() {
    if (this.submitting) return;

    this.submitting = true;
    const answersList = Object.keys(this.selectedAnswers).map(qId => ({
      questionId: qId,
      selectedOption: this.selectedAnswers[qId]
    }));

    this.submissionService.submitMCQ({
      assignmentId: this.assignmentId,
      answers: answersList
    }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.toast.success(res.message, 'Quiz Results');
        this.router.navigate(['/student/marks']);
      },
      error: () => {
        this.submitting = false;
      }
    });
  }
}
