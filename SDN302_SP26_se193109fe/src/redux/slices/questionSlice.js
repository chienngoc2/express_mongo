import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api';
import { fetchQuizDetails } from './quizSlice';

// Add a question directly inside a quiz (Case: Create new question or link existing)
export const addQuestionToQuiz = createAsyncThunk(
  'question/addQuestionToQuiz',
  async ({ quizId, questionData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.post(`/quizzes/${quizId}/question`, questionData);
      // Reload the quiz details to reflect the new question
      dispatch(fetchQuizDetails(quizId));
      return response.data; // contains updated quiz object
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error?.message || 
        'Không thể thêm câu hỏi vào bộ đề!'
      );
    }
  }
);

// Update details of a specific question
export const updateQuestion = createAsyncThunk(
  'question/updateQuestion',
  async ({ id, quizId, questionData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.put(`/questions/${id}`, questionData);
      // Reload the quiz details to reflect the updated question details
      if (quizId) {
        dispatch(fetchQuizDetails(quizId));
      }
      return response.data; // updated question object
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error?.message || 
        'Không thể cập nhật câu hỏi!'
      );
    }
  }
);

// Delete a question from a quiz
export const deleteQuestionFromQuiz = createAsyncThunk(
  'question/deleteQuestionFromQuiz',
  async ({ quizId, questionId }, { dispatch, rejectWithValue }) => {
    try {
      await API.delete(`/quizzes/${quizId}/questions/${questionId}`);
      // Reload the quiz details to reflect the deletion
      dispatch(fetchQuizDetails(quizId));
      return { quizId, questionId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error?.message || 
        'Không thể xóa câu hỏi!'
      );
    }
  }
);

const initialState = {
  loading: false,
  error: null,
};

const questionSlice = createSlice({
  name: 'question',
  initialState,
  reducers: {
    clearQuestionError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // addQuestionToQuiz
    builder
      .addCase(addQuestionToQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuestionToQuiz.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addQuestionToQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // updateQuestion
    builder
      .addCase(updateQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuestion.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // deleteQuestionFromQuiz
    builder
      .addCase(deleteQuestionFromQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestionFromQuiz.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteQuestionFromQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearQuestionError } = questionSlice.actions;
export default questionSlice.reducer;
