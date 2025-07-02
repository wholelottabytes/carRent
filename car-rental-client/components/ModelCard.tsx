import { Card, CardMedia, CardContent, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function ModelCard({ model }: { model: any }) {
  const router = useRouter();

  return (
    <Card>
      {model.photos?.[0] && (
        <CardMedia
          component="img"
          height="140"
          image={model.photos[0].url}
          alt={model.modelName}
        />
      )}
      <CardContent>
        <Typography variant="h6">
          {model.make} {model.modelName}
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Цены:
        </Typography>
        {model.rentalPrices && model.rentalPrices.length > 0 ? (
          <List dense>
            {model.rentalPrices.map((price: any) => (
              <ListItem key={price.id} disablePadding>
                <ListItemText primary={`${price.priceType}: ${price.price} ₽`} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Нет данных о ценах</Typography>
        )}

        <Button onClick={() => router.push(`/models/${model.carModelId}`)} sx={{ mt: 2 }}>
          Подробнее
        </Button>
      </CardContent>
    </Card>
  );
}
