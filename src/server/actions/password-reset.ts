'use server';

import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import { sendPasswordResetLink } from '@/lib/email';
import crypto from 'crypto';

export async function requestPasswordReset(email: string) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return { 
        success: true, 
        message: 'If an account exists with that email, you will receive a password reset link.' 
      };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        custom: {
          ...(typeof user.custom === 'object' ? user.custom : {}),
          resetToken: resetTokenHash,
          resetTokenExpiry: resetTokenExpiry.toISOString(),
        },
      },
    });

    // Send reset email
    const resetUrl = `${process.env.APP_URL || process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    try {
      await sendPasswordResetLink(user.email, user.name, resetUrl);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success to not reveal if email exists
    }

    return { 
      success: true, 
      message: 'If an account exists with that email, you will receive a password reset link.' 
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { 
      success: false, 
      message: 'An error occurred. Please try again later.' 
    };
  }
}

export async function resetPassword(email: string, token: string, newPassword: string) {
  try {
    // Validate password length
    if (newPassword.length < 8) {
      return { 
        success: false, 
        message: 'Password must be at least 8 characters long.' 
      };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { 
        success: false, 
        message: 'Invalid or expired reset link.' 
      };
    }

    // Check if token exists and is not expired
    const customData = user.custom as any;
    if (!customData?.resetToken || !customData?.resetTokenExpiry) {
      return { 
        success: false, 
        message: 'Invalid or expired reset link.' 
      };
    }

    // Check if token is expired
    const tokenExpiry = new Date(customData.resetTokenExpiry);
    if (tokenExpiry < new Date()) {
      return { 
        success: false, 
        message: 'Reset link has expired. Please request a new one.' 
      };
    }

    // Verify token
    const isValidToken = await bcrypt.compare(token, customData.resetToken);
    if (!isValidToken) {
      return { 
        success: false, 
        message: 'Invalid or expired reset link.' 
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        custom: {
          ...(typeof user.custom === 'object' ? user.custom : {}),
          resetToken: null,
          resetTokenExpiry: null,
        },
      },
    });

    return { 
      success: true, 
      message: 'Password reset successfully! You can now sign in with your new password.' 
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      message: 'An error occurred. Please try again later.' 
    };
  }
}
