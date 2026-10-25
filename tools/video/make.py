import subprocess,json,os,glob,shutil
from kokoro_onnx import Kokoro
import soundfile as sf
D=os.path.dirname(os.path.abspath(__file__))+'/';os.chdir(D)
TT=D+'../tts/';KK=Kokoro(TT+'kokoro-q8.onnx',TT+'voices.npz')
GAME=glob.glob('raw/*.webm')[0];W,H=1080,1920
# (kind, screenshot or game second, headline (*word = gold), voice line, caption)
SEG=[('intro',None,'','Gridiron 27 just got its biggest glow up yet.','The new look update'),
 ('img','s_dash.png','A *whole new look','Every screen was redrawn from scratch, with your matchups in team colors.','Every screen, redrawn from scratch'),
 ('img','s_box.png','Broadcast *box scores','Box scores now look like a TV broadcast.','Box scores like a TV broadcast'),
 ('game',22,'More real *catches','Catches are more realistic. Diving and one handed grabs only land about half the time.','Diving and one-handed grabs land about half the time'),
 ('game',40,'Hit stick *defense','On defense, lunge, lay the hit stick, go for the ankles, and sprint.','Lunge, hit stick, ankle bite and sprint'),
 ('img','s_bracket.png','Real playoff *bracket','A real playoff bracket, and power rankings like the real high school polls.','Playoff bracket and real-style rankings'),
 ('img','s_gear.png','New *gear','Spats, eyeblack, tank tops, and custom end zone fonts.','Spats, eyeblack, tank tops, end zone fonts'),
 ('img','s_jersey.png','Any team\'s *jerseys','Customize any team\'s jerseys. Home, away, and alternate.','Home, away and alternate for every team'),
 ('game',26,'Faster on *PC','And menus open up to four times faster on PC.','Menus open up to 4x faster'),
 ('outro',None,'','Play it free at gridiron twenty seven dot neocities dot org.','Free in your browser, no download')]
def say(t,p):
  a,sr=KK.create(t.replace('Gridiron 27','Gridiron twenty-seven'),voice='am_michael',speed=1.08,lang='en-us');sf.write(p,a,sr)
def dur(f):return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]).decode())
def run(c):subprocess.run(c,check=True)
AF='[A]highpass=f=70,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120,apad,aresample=44100[a]'
parts=[]
ONLY=[int(x) for x in os.environ.get('ONLY','').split(',') if x]
for i,(kind,vis,head,line,sub) in enumerate(SEG):
  if ONLY and i not in ONLY:parts.append(f'seg{i}.mp4');continue
  wav=f'v{i}.wav';say(line,wav);d=dur(wav)+(1.4 if kind=='intro' else 0.5)
  if kind=='intro':d+=1.6   # the logo plays before the voice starts
  fd=f'fr{i}';shutil.rmtree(fd,ignore_errors=True);os.makedirs(fd)
  cfg={'kind':'intro' if kind=='intro' else 'outro' if kind=='outro' else 'feat','dur':d,'head':head,'sub':sub,'solid':kind in('intro','outro','img'),'img':vis if kind=='img' else None}
  run(['node','frames.js',json.dumps(cfg),fd])
  out=f'seg{i}.mp4';delay=int(1800 if kind=='intro' else 250)
  ad=f'[1:a]adelay={delay}|{delay}[A];'+AF
  if kind=='game':
    fc=(f'[0:v]split[b][f];[b]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=30:3,eq=brightness=-0.15[bg];'
        f'[f]scale={W}:-2[fg];[bg][fg]overlay=0:(H-h)/2[v0];[v0][2:v]overlay=0:0,fps=30,format=yuv420p[v]')
    run(['ffmpeg','-loglevel','error','-y','-ss',str(vis),'-t',f'{d:.2f}','-i',GAME,'-i',wav,'-framerate','30','-i',f'{fd}/f%04d.png','-filter_complex',fc+';'+ad,
         '-map','[v]','-map','[a]','-t',f'{d:.2f}','-c:v','libx264','-preset','medium','-crf','19','-c:a','aac','-b:a','160k',out])
  else:
    run(['ffmpeg','-loglevel','error','-y','-framerate','30','-i',f'{fd}/f%04d.jpg','-i',wav,'-filter_complex','[0:v]format=yuv420p[v];'+ad,
         '-map','[v]','-map','[a]','-t',f'{d:.2f}','-c:v','libx264','-preset','medium','-crf','19','-c:a','aac','-b:a','160k',out])
  shutil.rmtree(fd);parts.append(out);print('segment',i,f'{d:.1f}s',flush=True)
open('list.txt','w').write(''.join(f"file '{p}'\n" for p in parts))
run(['ffmpeg','-loglevel','error','-y','-f','concat','-safe','0','-i','list.txt','-c:v','libx264','-preset','medium','-crf','20','-c:a','aac','-b:a','160k','-movflags','+faststart','Gridiron27_update_kanra.mp4'])
print('done',dur('Gridiron27_update_kanra.mp4'))
