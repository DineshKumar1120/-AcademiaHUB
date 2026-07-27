import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AssignmentService } from '../../core/services/assignment.service';
import { SubmissionService } from '../../core/services/submission.service';
import { ToastService } from '../../core/services/toast.service';
import { Assignment } from '../../core/models/assignment.model';
import { Submission, TestCaseResult } from '../../core/models/submission.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';

const DEFAULT_STARTER_CODES: Record<string, string> = {
  python: `# Python 3 Solution\nimport sys\n\ndef main():\n    # Read input from standard input\n    input_data = sys.stdin.read().strip().split()\n    if not input_data: return\n    \n    # Implement your solution logic here\n    # print(result)\n\nif __name__ == '__main__':\n    main()\n`,
  javascript: `// JavaScript (Node.js) Solution\nconst fs = require('fs');\n\nfunction main() {\n  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n  if (!input || !input[0]) return;\n  \n  // Implement your solution logic here\n  // console.log(result);\n}\n\nmain();\n`,
  cpp: `// C++ 17 Solution\n#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // Write your C++ solution here\n    \n    return 0;\n}\n`,
  java: `// Java Solution\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // Write your Java solution here\n    }\n}\n`
};

@Component({
  selector: 'app-programming-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent, StatusBadgePipe],
  template: `
    <div class="container-fluid p-0 fade-in mb-5">
      <app-loading-spinner *ngIf="loading" message="Loading programming problem statement..."></app-loading-spinner>

      <div *ngIf="!loading && assignment">
        <!-- Header -->
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div>
            <span class="badge bg-indigo-subtle text-indigo border border-indigo-subtle me-2 fw-semibold" style="color: #6366f1;">
              <i class="bi bi-code-slash me-1"></i> PROGRAMMING ASSIGNMENT
            </span>
            <span class="badge rounded-pill" [ngClass]="assignment.status | statusBadge">{{ assignment.status }}</span>
          </div>
          <button class="btn btn-outline-secondary btn-sm" (click)="goBack()">
            <i class="bi bi-arrow-left me-1"></i> Back
          </button>
        </div>

        <h3 class="fw-bold text-dark mb-2">{{ assignment.title }}</h3>

        <div class="row g-4">
          <!-- Problem Statement Left Column -->
          <div class="col-12 col-lg-5">
            <div class="card card-custom p-4 h-100 shadow-sm border-0">
              <h5 class="fw-bold text-dark mb-3"><i class="bi bi-file-earmark-code text-primary me-2"></i> Problem Description</h5>
              <div class="text-secondary leading-relaxed mb-4" style="white-space: pre-line;">
                {{ assignment.problemStatement || assignment.description }}
              </div>

              <div *ngIf="assignment.inputFormat" class="mb-3">
                <h6 class="fw-bold text-dark mb-1"><i class="bi bi-box-arrow-in-right text-info me-1"></i> Input Format</h6>
                <div class="p-2 bg-light rounded border text-muted extra-small font-monospace">{{ assignment.inputFormat }}</div>
              </div>

              <div *ngIf="assignment.outputFormat" class="mb-3">
                <h6 class="fw-bold text-dark mb-1"><i class="bi bi-box-arrow-right text-success me-1"></i> Output Format</h6>
                <div class="p-2 bg-light rounded border text-muted extra-small font-monospace">{{ assignment.outputFormat }}</div>
              </div>

              <div *ngIf="assignment.constraints" class="mb-3">
                <h6 class="fw-bold text-dark mb-1"><i class="bi bi-exclamation-triangle text-warning me-1"></i> Constraints</h6>
                <div class="p-2 bg-light rounded border text-danger extra-small font-monospace">{{ assignment.constraints }}</div>
              </div>

              <!-- Sample Input & Output -->
              <div *ngIf="assignment.sampleInput" class="row g-2 mt-2">
                <div class="col-6">
                  <h6 class="fw-bold text-dark mb-1">Sample Input</h6>
                  <pre class="p-2 bg-dark text-warning rounded border extra-small font-monospace mb-0" style="max-height: 150px; overflow-y: auto;">{{ assignment.sampleInput }}</pre>
                </div>
                <div class="col-6">
                  <h6 class="fw-bold text-dark mb-1">Sample Output</h6>
                  <pre class="p-2 bg-dark text-success rounded border extra-small font-monospace mb-0" style="max-height: 150px; overflow-y: auto;">{{ assignment.sampleOutput }}</pre>
                </div>
              </div>
            </div>
          </div>

          <!-- Code Workspace Right Column -->
          <div class="col-12 col-lg-7">
            <div class="card card-custom p-4 shadow-sm border-0 d-flex flex-column h-100">
              <!-- Language Selector & Controls -->
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0"><i class="bi bi-terminal text-success me-2"></i> Code Editor</h5>

                <div class="d-flex gap-2 align-items-center">
                  <select class="form-select form-select-sm fw-semibold border-secondary-subtle" style="width: 160px;" [(ngModel)]="language" (change)="onLanguageChange()">
                    <option value="python">Python 3 (3.10)</option>
                    <option value="javascript">JavaScript (Node)</option>
                    <option value="cpp">C++ (GCC 10.2)</option>
                    <option value="java">Java 15</option>
                  </select>
                  <button class="btn btn-sm btn-outline-secondary" (click)="resetStarterCode()" title="Reset to Starter Code">
                    <i class="bi bi-arrow-counterclockwise"></i>
                  </button>
                </div>
              </div>

              <!-- Code Editor Window -->
              <div class="mb-3 position-relative">
                <textarea
                  class="form-control font-monospace text-light bg-dark p-3 rounded-3 shadow-inner"
                  rows="14"
                  placeholder="# Write your solution code here..."
                  [(ngModel)]="codeContent"
                  style="font-size: 0.9rem; line-height: 1.5; tab-size: 4;"
                ></textarea>
              </div>

              <!-- Execution Control Buttons -->
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <button class="btn btn-outline-primary w-100 py-2 fw-semibold" (click)="runSampleTests()" [disabled]="runningCode || submittingCode || !codeContent.trim()">
                    <span *ngIf="runningCode" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!runningCode" class="bi bi-play-fill me-1"></i>
                    {{ runningCode ? 'Running Tests...' : 'Run Code (Sample Cases)' }}
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-success w-100 py-2 fw-semibold" (click)="submitSolution()" [disabled]="runningCode || submittingCode || !codeContent.trim()">
                    <span *ngIf="submittingCode" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!submittingCode" class="bi bi-cloud-upload-fill me-1"></i>
                    {{ submittingCode ? 'Evaluating...' : 'Submit Solution' }}
                  </button>
                </div>
              </div>

              <!-- Graded Submission Summary Banner -->
              <div *ngIf="submission && submission.status === 'GRADED'" class="p-3 bg-success-subtle border border-success-subtle rounded-3 mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <span class="fw-bold text-success"><i class="bi bi-check-circle-fill me-1"></i> Submission Status: GRADED</span>
                    <div class="text-secondary small mt-1" *ngIf="submission.feedback">"{{ submission.feedback }}"</div>
                  </div>
                  <div class="text-end">
                    <span class="badge bg-success fs-6">{{ submission.marksObtained }} / {{ assignment.totalMarks }} Marks</span>
                  </div>
                </div>
              </div>

              <!-- Test Execution Results Panel -->
              <div *ngIf="executionRun" class="mt-2 border rounded-3 p-3 bg-light fade-in">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="fw-bold mb-0 text-dark">
                    <i class="bi bi-card-checklist me-1"></i> Test Case Execution Results
                  </h6>
                  <span class="badge rounded-pill"
                    [ngClass]="{
                      'bg-success': executionRun.status === 'ACCEPTED',
                      'bg-danger': executionRun.status === 'WRONG_ANSWER',
                      'bg-warning text-dark': executionRun.status === 'COMPILATION_ERROR'
                    }">
                    {{ executionRun.status }}
                  </span>
                </div>

                <!-- Compilation Error Display -->
                <div *ngIf="executionRun.compilationError" class="p-3 bg-danger-subtle border border-danger-subtle rounded text-danger font-monospace extra-small mb-3">
                  <div class="fw-bold mb-1"><i class="bi bi-bug me-1"></i> Error / Output:</div>
                  <pre class="mb-0 text-wrap">{{ executionRun.compilationError }}</pre>
                </div>

                <!-- Individual Test Case Cards -->
                <div *ngIf="executionRun.testResults && executionRun.testResults.length > 0" class="accordion" id="testCasesAccordion">
                  <div *ngFor="let res of executionRun.testResults; let i = index" class="card mb-2 border shadow-sm">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center py-2 px-3">
                      <span class="fw-semibold small">
                        Test Case #{{ res.testCaseIndex || (i + 1) }}
                        <span *ngIf="res.isHidden" class="badge bg-secondary ms-1">Hidden</span>
                      </span>
                      <span class="badge" [ngClass]="res.passed ? 'bg-success' : 'bg-danger'">
                        {{ res.passed ? 'PASSED' : 'FAILED' }}
                      </span>
                    </div>
                    <div class="card-body p-3 font-monospace extra-small bg-light">
                      <div *ngIf="!res.isHidden">
                        <div class="row g-2">
                          <div class="col-6" *ngIf="res.input">
                            <span class="text-muted fw-bold">Input:</span>
                            <pre class="p-2 bg-white rounded border mb-0 text-dark">{{ res.input }}</pre>
                          </div>
                          <div class="col-6">
                            <span class="text-muted fw-bold">Expected Output:</span>
                            <pre class="p-2 bg-white rounded border mb-0 text-success">{{ res.expectedOutput }}</pre>
                          </div>
                        </div>
                        <div class="mt-2">
                          <span class="text-muted fw-bold">Actual Output:</span>
                          <pre class="p-2 bg-white rounded border mb-0" [ngClass]="res.passed ? 'text-success' : 'text-danger'">{{ res.actualOutput || '(No output)' }}</pre>
                        </div>
                      </div>
                      <div *ngIf="res.isHidden" class="text-muted italic">
                        Hidden test case details are omitted for academic integrity.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProgrammingAssignmentComponent implements OnInit {
  assignmentId = '';
  assignment: Assignment | null = null;
  submission: Submission | null = null;
  codeContent = '';
  language = 'python';
  loading = true;
  runningCode = false;
  submittingCode = false;

  executionRun: {
    status: string;
    allPassed: boolean;
    compilationError?: string;
    testResults: TestCaseResult[];
  } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private submissionService: SubmissionService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.assignmentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.assignmentId) this.loadAssignment();
  }

  loadAssignment() {
    this.loading = true;
    this.assignmentService.getAssignmentById(this.assignmentId).subscribe({
      next: (res) => {
        this.assignment = res.assignment;
        this.submission = res.submission || null;

        if (this.submission && (this.submission.code || this.submission.programmingCode)) {
          this.codeContent = this.submission.code || this.submission.programmingCode || '';
          if (this.submission.language) this.language = this.submission.language;
          if (this.submission.testResults && this.submission.testResults.length > 0) {
            this.executionRun = {
              status: this.submission.passedTestCases === this.submission.totalTestCases ? 'ACCEPTED' : 'WRONG_ANSWER',
              allPassed: this.submission.passedTestCases === this.submission.totalTestCases,
              testResults: this.submission.testResults
            };
          }
        } else {
          this.loadStarterCode();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadStarterCode() {
    if (this.assignment && this.assignment.starterCode && this.assignment.starterCode[this.language]) {
      this.codeContent = this.assignment.starterCode[this.language];
    } else {
      this.codeContent = DEFAULT_STARTER_CODES[this.language] || DEFAULT_STARTER_CODES['python'];
    }
  }

  onLanguageChange() {
    if (!this.submission || (!this.submission.code && !this.submission.programmingCode)) {
      this.loadStarterCode();
    }
  }

  resetStarterCode() {
    this.loadStarterCode();
    this.toast.info('Reset code editor to starter template.');
  }

  runSampleTests() {
    if (!this.codeContent.trim() || !this.assignmentId) return;

    this.runningCode = true;
    this.executionRun = null;

    this.submissionService.runCode({
      assignmentId: this.assignmentId,
      code: this.codeContent,
      language: this.language
    }).subscribe({
      next: (res) => {
        this.runningCode = false;
        this.executionRun = {
          status: res.status,
          allPassed: res.allPassed,
          compilationError: res.compilationError,
          testResults: res.testResults
        };

        if (res.allPassed) {
          this.toast.success('All sample test cases passed!');
        } else if (res.compilationError) {
          this.toast.error('Compilation Error / Execution Error');
        } else {
          this.toast.warning('Some sample test cases failed.');
        }
      },
      error: (err) => {
        this.runningCode = false;
        this.toast.error(err.error?.message || 'Failed to execute code');
      }
    });
  }

  submitSolution() {
    if (!this.codeContent.trim() || !this.assignmentId) return;

    this.submittingCode = true;
    this.executionRun = null;

    this.submissionService.submitProgramming({
      assignmentId: this.assignmentId,
      code: this.codeContent,
      programmingCode: this.codeContent,
      language: this.language
    }).subscribe({
      next: (res) => {
        this.submittingCode = false;
        this.toast.success(res.message);
        if (res.testResults) {
          this.executionRun = {
            status: res.passedTestCases === res.totalTestCases ? 'ACCEPTED' : 'WRONG_ANSWER',
            allPassed: res.passedTestCases === res.totalTestCases,
            testResults: res.testResults
          };
        }
        this.loadAssignment();
      },
      error: (err) => {
        this.submittingCode = false;
        this.toast.error(err.error?.message || 'Failed to evaluate code submission');
      }
    });
  }

  goBack() {
    window.history.back();
  }
}
