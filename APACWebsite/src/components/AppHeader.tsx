import React, { useEffect, useState } from 'react';
import { Header, Group, Container, Text, ActionIcon, Badge, useMantineTheme, Button, Drawer, List, ThemeIcon, Menu, Divider } from '@mantine/core';
import { IconShoppingCart, IconCategory, IconHome, IconInfoCircle, IconPhone, IconChevronDown } from '@tabler/icons-react';
import Link from 'next/link';
import { useCartStore } from '../store/cartStore';
import { useRouter } from 'next/router';

export function AppHeader() {
  const theme = useMantineTheme();
  const router = useRouter();
  const cartItems = useCartStore(state => state.items);
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const [badgeAnimating, setBadgeAnimating] = useState(false);

  // Calculate total items in cart
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Watch for changes in cart items to trigger badge animation
  useEffect(() => {
    if (totalItems > 0) {
      setBadgeAnimating(true);
      const timer = setTimeout(() => {
        setBadgeAnimating(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  // Navigation items
  const navItems = [
    { label: 'Home', path: '/', icon: IconHome },
    { label: 'Categories', path: '#', icon: IconCategory, hasSubmenu: true },
    { label: 'About Us', path: '/about', icon: IconInfoCircle },
    { label: 'Contact', path: '/contact', icon: IconPhone },
  ];

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(path);
  };

  return (
    <>
      <Header height={70} p="md" sx={(theme) => ({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
        borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
      })}>
        <Container size="xl">
          <Group position="apart">
            <Group>
              <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                <Text weight={700} size="xl">APAC Shop</Text>
              </Link>
            </Group>

            {/* Desktop Navigation */}
            <Group spacing="md" sx={(theme) => ({
              display: 'none', // Hide by default
              [theme.fn.largerThan('sm')]: {
                display: 'flex', // Show only on screens larger than small
              },
            })}>
              {navItems.map((item) => (
                !item.hasSubmenu ? (
                  <Link key={item.label} href={item.path} passHref>
                    <Button
                      variant={isActive(item.path) ? "light" : "subtle"}
                      color={isActive(item.path) ? theme.primaryColor : "gray"}
                      leftIcon={<item.icon size={16} />}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ) : (
                  <Menu key={item.label} position="bottom" trigger="hover" transitionProps={{ transition: 'pop-top-right' }} withinPortal>
                    <Menu.Target>
                      <Button
                        variant="subtle"
                        color="gray"
                        rightIcon={<IconChevronDown size={16} />}
                        leftIcon={<item.icon size={16} />}
                      >
                        {item.label}
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>Product Categories</Menu.Label>
                      <Menu.Item component={Link} href="/category/outdoor">Outdoor</Menu.Item>
                      <Menu.Item component={Link} href="/category/fitness">Fitness</Menu.Item>
                      <Menu.Item component={Link} href="/category/apparel">Apparel</Menu.Item>
                      <Menu.Item component={Link} href="/category/accessories">Accessories</Menu.Item>
                      <Divider />
                      <Menu.Item component={Link} href="/categories">All Categories</Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )
              ))}

              <Link href="/cart" passHref>
                <ActionIcon 
                  size="lg" 
                  variant="filled" 
                  color={theme.primaryColor} 
                  style={{ position: 'relative' }}
                >
                  <IconShoppingCart size={20} />
                  {totalItems > 0 && (
                    <Badge 
                      size="sm" 
                      color="red" 
                      variant="filled" 
                      style={{ 
                        position: 'absolute', 
                        top: -5, 
                        right: -5,
                        transform: badgeAnimating ? 'scale(1.2)' : 'scale(0.8)',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      {totalItems}
                    </Badge>
                  )}
                </ActionIcon>
              </Link>
            </Group>

            {/* Mobile Menu Button */}
            <Group sx={(theme) => ({
              display: 'flex', // Show by default
              [theme.fn.largerThan('sm')]: {
                display: 'none', // Hide on screens larger than small
              },
            })}>
              <Link href="/cart" passHref>
                <ActionIcon 
                  size="lg" 
                  variant="filled" 
                  color={theme.primaryColor} 
                  style={{ position: 'relative' }}
                  mr="sm"
                >
                  <IconShoppingCart size={20} />
                  {totalItems > 0 && (
                    <Badge 
                      size="sm" 
                      color="red" 
                      variant="filled" 
                      style={{ 
                        position: 'absolute', 
                        top: -5, 
                        right: -5,
                        transform: badgeAnimating ? 'scale(1.2)' : 'scale(0.8)',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      {totalItems}
                    </Badge>
                  )}
                </ActionIcon>
              </Link>
              <ActionIcon 
              size="lg" 
              variant="subtle"
              onClick={() => setMobileMenuOpened(true)}
              >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              </ActionIcon>
            </Group>
          </Group>
        </Container>
      </Header>

      {/* Mobile Navigation Drawer */}
      <Drawer
        opened={mobileMenuOpened}
        onClose={() => setMobileMenuOpened(false)}
        padding="xl"
        size="sm"
        position="right"
        title="Menu"
      >
        <List spacing="md" size="sm" center>
          {navItems.map((item) => (
            <List.Item
              key={item.label}
              icon={
                <ThemeIcon color={isActive(item.path) ? theme.primaryColor : 'gray'} variant="light">
                  <item.icon size={16} />
                </ThemeIcon>
              }
              onClick={() => {
                if (!item.hasSubmenu) {
                  router.push(item.path);
                  setMobileMenuOpened(false);
                }
              }}
            >
              {!item.hasSubmenu ? (
                item.label
              ) : (
                <>
                  <Text>{item.label}</Text>
                  <List withPadding ml={20} mt="xs">
                    <List.Item 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/category/outdoor');
                        setMobileMenuOpened(false);
                      }}
                    >
                      Outdoor
                    </List.Item>
                    <List.Item 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/category/fitness');
                        setMobileMenuOpened(false);
                      }}
                    >
                      Fitness
                    </List.Item>
                    <List.Item 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/category/apparel');
                        setMobileMenuOpened(false);
                      }}
                    >
                      Apparel
                    </List.Item>
                    <List.Item 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/category/accessories');
                        setMobileMenuOpened(false);
                      }}
                    >
                      Accessories
                    </List.Item>
                    <List.Item 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/categories');
                        setMobileMenuOpened(false);
                      }}
                    >
                      <Text weight={500}>All Categories</Text>
                    </List.Item>
                  </List>
                </>
              )}
            </List.Item>
          ))}
        </List>
      </Drawer>
    </>
  );
}