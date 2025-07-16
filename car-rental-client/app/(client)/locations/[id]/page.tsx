'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Divider,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert as MuiAlert,
  AlertProps,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useAppSelector } from '@/lib/hooks';
import { fetcher } from '@/lib/fetcher';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function LocationPage() {
  interface Location {
    id: string;
    city: string;
    name: string;
    address: string;
  }

  interface Review {
    id?: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
  }

  const { id } = useParams();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const [location, setLocation] = useState<Location | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    fetcher(`/api/RentalLocation/Get/${id}`)
      .then((r) => r.json())
      .then(setLocation)
      .catch(() => showSnackbar('Ошибка загрузки локации.', 'error'));

    fetcher(`/api/Review/${id}?page=1&pageSize=20`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews);

        if (user && data.reviews) {
          const existing = data.reviews.find((r: Review) => r.userId === user.id);
          if (existing) {
            setUserReview(existing);
            setComment(existing.comment);
            setRating(existing.rating);
            showSnackbar('Вы уже оставляли отзыв — вы можете его отредактировать.', 'info');
          } else {
            setUserReview(null);
            setComment('');
            setRating(5);
          }
        }
      })
      .catch(() => showSnackbar('Ошибка загрузки отзывов.', 'error'));
  }, [id, user]);

  const submitReview = async () => {
    if (!user) {
      router.push('/register');
      return;
    }

    setIsSubmitting(true);

    try {
      const method = userReview ? 'PUT' : 'POST';
      const url = userReview ? `/api/Review/${userReview.id}` : '/api/Review';

      await fetcher(url, {
        method,
        body: JSON.stringify({
          rentalLocationId: id,
          rating,
          comment,
        }),
      });

      const updated = await fetcher(`/api/Review/${id}?page=1&pageSize=20`);
      const data = await updated.json();
      setReviews(data.reviews);

      if (userReview) {
        setUserReview({ ...userReview, rating, comment });
        showSnackbar('Отзыв успешно обновлен.', 'success');
      } else {
        const newReview = data.reviews.find((r: Review) => r.userId === user.id);
        if (newReview) {
            setUserReview(newReview);
        }
        showSnackbar('Отзыв успешно добавлен.', 'success');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showSnackbar(`Ошибка при сохранении отзыва: ${err.message}`, 'error');
      } else {
        showSnackbar('Ошибка при сохранении отзыва.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IconButton
          key={i}
          onClick={() => setRating(i)}
          size="small"
          sx={{ color: i <= rating ? '#ffb400' : '#ccc' }}
          aria-label={`${i} star`}
        >
          {i <= rating ? <StarIcon /> : <StarBorderIcon />}
        </IconButton>
      );
    }
    return stars;
  };

  if (!location)
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Загрузка...</Typography>
      </Container>
    );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {location.city}, {location.name}
      </Typography>
      <Typography>{location.address}</Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        Отзывы
      </Typography>

      {reviews.length === 0 ? (
        <Typography>Отзывов пока нет.</Typography>
      ) : (
        reviews.map((r) => (
          <Box key={r.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle2">{r.userName}</Typography>
            <Box sx={{ color: '#ffb400' }}>
              {Array.from({ length: 5 }).map((_, idx) =>
                idx < r.rating ? (
                  <StarIcon key={idx} fontSize="small" />
                ) : (
                  <StarBorderIcon key={idx} fontSize="small" />
                )
              )}
            </Box>
            <Typography>{r.comment}</Typography>
            <Divider sx={{ my: 1 }} />
          </Box>
        ))
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6">Оставить отзыв</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>{renderStars()}</Box>

      <TextField
        fullWidth
        label="Комментарий"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        multiline
        rows={3}
        sx={{ my: 2 }}
      />

      <Button variant="contained" onClick={submitReview} disabled={isSubmitting}>
        {userReview ? 'Обновить отзыв' : 'Отправить'}
      </Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}