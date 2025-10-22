import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withProductionSecurity } from '@/lib/cors';

export const GET = withProductionSecurity(async function(request: NextRequest) {
  try {
    console.log('📊 GET /api/leads called');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    console.log('🔍 Query parameters:', { page, limit, status, search, where });
    
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);
    
    console.log('✅ Leads query successful. Found:', leads.length, 'leads, total:', total);
    
    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('❌ Error in GET /api/leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});

export const POST = withProductionSecurity(async function(request: NextRequest) {
  try {
    console.log('📝 POST /api/leads called');
    
    const body = await request.json();
    console.log('📄 Request body:', body);
    
    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      status = 'NEW',
      assignedToId,
      notes,
    } = body;
    
    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'First name, last name, and phone are required' },
        { status: 400 }
      );
    }
    
    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        address,
        city,
        state,
        zipCode,
        status,
        assignedToId,
        notes,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });
    
    console.log('✅ Lead created successfully:', lead.id);
    
    return NextResponse.json(lead, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error in POST /api/leads:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});