import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractTokenFromRequest, getUserIdFromToken } from '@/lib/auth-utils';

async function getFullCart(userId: string) {
  // యూజర్ ఐడిని కన్సోల్‌లో ప్రింట్ చేయండి (డీబగ్గింగ్ కోసం)
  console.log("Checking User ID in DB:", userId);

  const user = await db.user.findUnique({ where: { id: userId } });
  
  // సబ్మిషన్ కోసం: యూజర్ లేకపోతే ఒక కొత్త కార్ట్ క్రియేట్ చేయడానికి బదులు, 
  // కనీసం యూజర్ లేరని క్లియర్ గా ఎర్రర్ ఇచ్చేలా చేద్దాం.
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return await db.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: { select: { id: true, name: true, slug: true } },
              brand: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      },
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    const userId = getUserIdFromToken(token);

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cart = await getFullCart(userId);
    const subtotal = cart.items.reduce((sum, item) => sum + (item.product.salePrice || item.product.basePrice) * item.quantity, 0);
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({ cart, subtotal, totalItems });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "USER_NOT_FOUND" ? 404 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId, variantId, quantity = 1 } = await request.json();

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) return NextResponse.json({ error: 'Product unavailable' }, { status: 404 });

    const cart = await getFullCart(userId);

    const existingItem = await db.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId || null }
    });

    if (existingItem) {
      await db.cartItem.update({ where: { id: existingItem.id }, data: { quantity: existingItem.quantity + quantity } });
    } else {
      await db.cartItem.create({ data: { cartId: cart.id, productId, variantId: variantId || null, quantity } });
    }

    return NextResponse.json({ message: 'Item added successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "USER_NOT_FOUND" ? 404 : 500 });
  }
}