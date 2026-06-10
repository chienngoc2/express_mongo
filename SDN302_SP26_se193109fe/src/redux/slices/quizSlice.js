import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api';

// Fetch all quizzes
export const fetchQuizzes = createAsyncThunk(
  'quiz/fetchQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/quizzes');
      return response.data; // array of quizzes
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách đề thi!');
    }
  }
);

// Fetch quizzes owned by the current user
export const fetchMyQuizzes = createAsyncThunk(
  'quiz/fetchMyQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/quizzes/my/list');
      return response.data; // array of quizzes owned by user
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy đề thi của bạn!');
    }
  }
);

// Fetch a single quiz with its full questions
export const fetchQuizDetails = createAsyncThunk(
  'quiz/fetchQuizDetails',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/quizzes/${quizId}`);
      return response.data; // single quiz object with populated questions
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy thông tin chi tiết đề thi!');
    }
  }
);

// Create a new quiz
export const createQuiz = createAsyncThunk(
  'quiz/createQuiz',
  async (quizData, { rejectWithValue }) => {
    try {
      const response = await API.post('/quizzes', quizData);
      return response.data; // created quiz object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Tạo đề thi mới thất bại!');
    }
  }
);

// Update a quiz
export const updateQuiz = createAsyncThunk(
  'quiz/updateQuiz',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/quizzes/${id}`, data);
      return response.data; // updated quiz object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật đề thi thất bại!');
    }
  }
);

// Delete a quiz
export const deleteQuiz = createAsyncThunk(
  'quiz/deleteQuiz',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/quizzes/${id}`);
      return id; // return deleted id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xóa đề thi thất bại!');
    }
  }
);

const initialState = {
  quizzes: [],
  myQuizzes: [],
  currentQuiz: null,
  loading: false,
  error: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },
    clearQuizError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // fetchQuizzes
    builder
      .addCase(fetchQuizzes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchQuizzes.fulfilled, (state, action) => { state.loading = false; state.quizzes = action.payload; })
      .addCase(fetchQuizzes.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // fetchMyQuizzes
    builder
      .addCase(fetchMyQuizzes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyQuizzes.fulfilled, (state, action) => { state.loading = false; state.myQuizzes = action.payload; })
      .addCase(fetchMyQuizzes.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // fetchQuizDetails
    builder
      .addCase(fetchQuizDetails.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchQuizDetails.fulfilled, (state, action) => { state.loading = false; state.currentQuiz = action.payload; })
      .addCase(fetchQuizDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // createQuiz
    builder
      .addCase(createQuiz.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes.push(action.payload);
        state.myQuizzes.push(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // updateQuiz
    builder
      .addCase(updateQuiz.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.loading = false;
        const index1 = state.quizzes.findIndex(q => q._id === action.payload._id);
        if (index1 !== -1) state.quizzes[index1] = action.payload;
        
        const index2 = state.myQuizzes.findIndex(q => q._id === action.payload._id);
        if (index2 !== -1) state.myQuizzes[index2] = action.payload;

        if (state.currentQuiz && state.currentQuiz._id === action.payload._id) {
          state.currentQuiz = { ...state.currentQuiz, ...action.payload };
        }
      })
      .addCase(updateQuiz.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // deleteQuiz
    builder
      .addCase(deleteQuiz.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = state.quizzes.filter(q => q._id !== action.payload);
        state.myQuizzes = state.myQuizzes.filter(q => q._id !== action.payload);
        if (state.currentQuiz && state.currentQuiz._id === action.payload) {
          state.currentQuiz = null;
        }
      })
      .addCase(deleteQuiz.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { clearCurrentQuiz, clearQuizError } = quizSlice.actions;
export default quizSlice.reducer;
