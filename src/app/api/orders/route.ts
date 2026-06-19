import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractTokenFromRequest, getUserIdFromToken } from '@/lib/auth-utils';

async function getFullCart(userId: string) {
  // 1. యూజర్ ఉన్నారో లేదో డేటాబేస్ లో చెక్ చేస్తున్నాం
  const user = await db.user.findUnique({ where: { id: userId } });
  
  // ఒకవేళ యూజర్ లేకపోతే, కచ్చితంగా ఈ ఎర్రర్ వస్తుంది
  if (!user) {
    console.error("DB లో ఈ ID తో యూజర్ లేరు:", userId);
    throw new Error("USER_NOT_FOUND");
  }

  // 2. కార్ట్ ఉంటే తీసుకుంటాం, లేకపోతే కొత్తది క్రియేట్ చేస్తాం
  return await db.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          product: true,
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
    return NextResponse.json({ cart });
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

    // ప్రాడక్ట్ ఉందో లేదో చూడాలి
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const cart = await getFullCart(userId);

    // కార్ట్ ఐటమ్ ఉందో లేదో చూడాలి
    const existingItem = await db.cartItem.findFirst({
      where: { cartId: cart.id, productId }
    });

    if (existingItem) {
      await db.cartItem.update({ where: { id: existingItem.id }, data: { quantity: existingItem.quantity + quantity } });
    } else {
      await db.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
    }

    return NextResponse.json({ message: 'Success' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "USER_NOT_FOUND" ? 404 : 500 });
  }
}