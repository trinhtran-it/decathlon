import React from 'react';
import { Group, Text, ActionIcon, NumberInput, Image, Paper } from '@mantine/core';
import { createStyles } from '@mantine/styles';
import { IconTrash } from '@tabler/icons-react';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';

const useStyles = createStyles((theme) => ({
  item: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  imageContainer: {
    width: 80,
    height: 80,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: theme.radius.sm,
  }
}));

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export function CartItemComponent({ id, name, price, quantity, image }: CartItemProps) {
  const { classes } = useStyles();
  const { updateQuantity, removeItem } = useCartStore();
  const { products, updateStock } = useProductStore();
  
  const product = products.find(p => p.id === id);
  const maxQuantity = quantity + (product?.stock?.quantity || 0);

  const handleQuantityChange = (value: number) => {
    const change = value - quantity;
    updateQuantity(id, value);
    updateStock(id, -change); // negative change because we're returning items to stock
  };

  const handleRemove = () => {
    removeItem(id);
    updateStock(id, -quantity); // return all items to stock
  };

  return (
    <Paper withBorder className={classes.item}>
      <Group position="apart">
        <Group>
          <div className={classes.imageContainer}>
            <Image src={image} alt={name} className={classes.image} />
          </div>
          
          <div>
            <Text weight={500}>{name}</Text>
            <Text size="sm" color="dimmed">
              ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)}
            </Text>
          </div>
        </Group>
        
        <Group>
          <NumberInput
            value={quantity}
            min={1}
            max={maxQuantity}
            onChange={(value) => handleQuantityChange(value || 1)}
            styles={{ input: { width: 54 } }}
          />
          <Text weight={500}>${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price * quantity)}</Text>
          <ActionIcon color="red" onClick={handleRemove}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
}