// Copyright (c) Stav Lobel
// stavlobel@gmail.com
// All rights reserved.
//
// This file is part of the 'What's the Chance?' web application.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool showLogin = true;
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'מה הסיכוי?',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'Arial',
        useMaterial3: true,
      ),
      home: Directionality(
        textDirection: TextDirection.rtl,
        child: showLogin
            ? LoginPage(onRegisterTap: () => setState(() => showLogin = false))
            : RegistrationPage(onLoginTap: () => setState(() => showLogin = true)),
      ),
      locale: const Locale('he'),
      supportedLocales: const [Locale('he')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
    );
  }
}

class LoginPage extends StatefulWidget {
  final VoidCallback onRegisterTap;
  const LoginPage({super.key, required this.onRegisterTap});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String? _errorMessage;
  bool _isLoading = false;
  bool _obscurePassword = true;

  Future<void> _login() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    final url = Uri.parse('http://localhost:8000/users/login');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': _emailController.text,
          'password': _passwordController.text,
        }),
      );
      if (response.statusCode == 200) {
        // Success: show dialog or navigate
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('התחברת בהצלחה!'),
            content: const Text('ברוך הבא למה הסיכוי?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('סגור'),
              ),
            ],
          ),
        );
      } else {
        final data = jsonDecode(response.body);
        setState(() {
          _errorMessage = data['detail'] ?? 'שגיאה לא ידועה';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'שגיאת רשת: לא ניתן להתחבר לשרת';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      body: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Card(
                elevation: 6,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                margin: const EdgeInsets.symmetric(horizontal: 24),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 36),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'מה הסיכוי?',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'בחר אחת מהאפשרויות כדי להמשיך',
                        style: TextStyle(
                          fontSize: 16,
                          color: Color(0xFF7CB342),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      TextField(
                        controller: _emailController,
                        textAlign: TextAlign.right,
                        decoration: InputDecoration(
                          hintText: 'כתובת אימייל',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _passwordController,
                        textAlign: TextAlign.right,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          hintText: 'סיסמה',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          suffixIcon: IconButton(
                            icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
                            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: _isLoading
                            ? null
                            : () {
                                setState(() {
                                  if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
                                    _errorMessage = 'אנא הזן כתובת אימייל וסיסמה';
                                  } else {
                                    _errorMessage = null;
                                    _login();
                                  }
                                });
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0057A3),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2.5,
                                ),
                              )
                            : const Text(
                                'התחבר',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                      ),
                      if (_errorMessage != null) ...[
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.black87,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  _errorMessage!,
                                  style: const TextStyle(color: Colors.white, fontSize: 16),
                                  textAlign: TextAlign.right,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close, color: Colors.white),
                                onPressed: () => setState(() => _errorMessage = null),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 12),
                      const Text(
                        'או המשך עם',
                        style: TextStyle(fontSize: 16, color: Color(0xFF7CB342)),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _SocialIconButton(icon: Icons.apple, onTap: () {}),
                          const SizedBox(width: 16),
                          _SocialIconButton(icon: Icons.facebook, onTap: () {}),
                          const SizedBox(width: 16),
                          _SocialIconButton(icon: Icons.g_mobiledata, onTap: () {}),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text('אין לך חשבון?', style: TextStyle(fontSize: 16)),
                          TextButton(
                            onPressed: widget.onRegisterTap,
                            child: const Text('הרשמה', style: TextStyle(fontSize: 16)),
                          ),
                        ],
                      ),
                      copyrightFooter(),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class RegistrationPage extends StatefulWidget {
  final VoidCallback onLoginTap;
  const RegistrationPage({super.key, required this.onLoginTap});

  @override
  State<RegistrationPage> createState() => _RegistrationPageState();
}

class _RegistrationPageState extends State<RegistrationPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  String? _errorMessage;
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  bool get _isEmailValid {
    final email = _emailController.text.trim();
    final emailRegex = RegExp(r"^[\w-.]+@([\w-]+\.)+[\w-]{2,4}");
    return emailRegex.hasMatch(email);
  }

  bool get _isPasswordValid {
    final password = _passwordController.text;
    final hasMinLength = password.length >= 8;
    final hasLetter = RegExp(r"[A-Za-z]").hasMatch(password);
    final hasNumber = RegExp(r"[0-9]").hasMatch(password);
    final hasSpecial = RegExp(r"[!@#\$%^&*(),.?':{}|<>]").hasMatch(password);
    return hasMinLength && hasLetter && hasNumber && hasSpecial;
  }

  bool get _doPasswordsMatch {
    return _passwordController.text == _confirmPasswordController.text;
  }

  Future<void> _register() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    final url = Uri.parse('http://localhost:8000/users/register');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': _emailController.text.trim(),
          'password': _passwordController.text,
        }),
      );
      if (response.statusCode == 200) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('נרשמת בהצלחה!'),
            content: const Text('החשבון נוצר, אפשר להתחבר.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  widget.onLoginTap();
                },
                child: const Text('התחבר'),
              ),
            ],
          ),
        );
      } else {
        final data = jsonDecode(response.body);
        setState(() {
          _errorMessage = data['detail'] ?? 'שגיאה לא ידועה';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'שגיאת רשת: לא ניתן להתחבר לשרת';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      body: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Card(
                elevation: 6,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                margin: const EdgeInsets.symmetric(horizontal: 24),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 36),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'הרשמה',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'הזן כתובת אימייל וסיסמה חזקה',
                        style: TextStyle(
                          fontSize: 16,
                          color: Color(0xFF7CB342),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      TextField(
                        controller: _emailController,
                        textAlign: TextAlign.right,
                        decoration: InputDecoration(
                          hintText: 'כתובת אימייל',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                        keyboardType: TextInputType.emailAddress,
                        onChanged: (_) => setState(() {}),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _passwordController,
                        textAlign: TextAlign.right,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          hintText: 'סיסמה',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          suffixIcon: IconButton(
                            icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
                            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                          ),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _confirmPasswordController,
                        textAlign: TextAlign.right,
                        obscureText: _obscureConfirmPassword,
                        decoration: InputDecoration(
                          hintText: 'אימות סיסמה',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          suffixIcon: IconButton(
                            icon: Icon(_obscureConfirmPassword ? Icons.visibility : Icons.visibility_off),
                            onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
                          ),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                      const SizedBox(height: 8),
                      if (!_isEmailValid && _emailController.text.isNotEmpty)
                        const Text('כתובת אימייל לא תקינה', style: TextStyle(color: Colors.red, fontSize: 14), textAlign: TextAlign.right),
                      if (!_isPasswordValid && _passwordController.text.isNotEmpty)
                        const Text('הסיסמה חייבת להיות לפחות 8 תווים, לכלול אות, מספר ותו מיוחד', style: TextStyle(color: Colors.red, fontSize: 14), textAlign: TextAlign.right),
                      if (!_doPasswordsMatch && _confirmPasswordController.text.isNotEmpty)
                        const Text('הסיסמאות אינן תואמות', style: TextStyle(color: Colors.red, fontSize: 14), textAlign: TextAlign.right),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _isLoading || !_isEmailValid || !_isPasswordValid || !_doPasswordsMatch
                            ? null
                            : _register,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0057A3),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2.5,
                                ),
                              )
                            : const Text(
                                'הרשמה',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                      ),
                      if (_errorMessage != null) ...[
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.black87,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  _errorMessage!,
                                  style: const TextStyle(color: Colors.white, fontSize: 16),
                                  textAlign: TextAlign.right,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close, color: Colors.white),
                                onPressed: () => setState(() => _errorMessage = null),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 12),
                      const Text(
                        'או המשך עם',
                        style: TextStyle(fontSize: 16, color: Color(0xFF7CB342)),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _SocialIconButton(icon: Icons.apple, onTap: () {}),
                          const SizedBox(width: 16),
                          _SocialIconButton(icon: Icons.facebook, onTap: () {}),
                          const SizedBox(width: 16),
                          _SocialIconButton(icon: Icons.g_mobiledata, onTap: () {}),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text('יש לך חשבון?', style: TextStyle(fontSize: 16)),
                          TextButton(
                            onPressed: widget.onLoginTap,
                            child: const Text('התחבר', style: TextStyle(fontSize: 16)),
                          ),
                        ],
                      ),
                      copyrightFooter(),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SocialIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _SocialIconButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Ink(
      decoration: const ShapeDecoration(
        color: Color(0xFFF1F3F4),
        shape: CircleBorder(),
      ),
      child: IconButton(
        icon: Icon(icon, size: 32, color: Colors.black87),
        onPressed: onTap,
      ),
    );
  }
}

Widget copyrightFooter() {
  return Padding(
    padding: const EdgeInsets.only(top: 32.0, bottom: 12.0),
    child: Text(
      '© סתיו לובל | stavlobel@gmail.com | כל הזכויות שמורות',
      style: const TextStyle(
        fontSize: 13,
        color: Colors.grey,
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.rtl,
    ),
  );
}
