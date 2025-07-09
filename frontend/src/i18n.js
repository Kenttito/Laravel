import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import tr from './locales/tr.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import sv from './locales/sv.json';
import da from './locales/da.json';
import no from './locales/no.json';
import fi from './locales/fi.json';
import cs from './locales/cs.json';
import hu from './locales/hu.json';
import ro from './locales/ro.json';
import bg from './locales/bg.json';
import hr from './locales/hr.json';
import sk from './locales/sk.json';
import sl from './locales/sl.json';
import et from './locales/et.json';
import lv from './locales/lv.json';
import lt from './locales/lt.json';
import el from './locales/el.json';
import he from './locales/he.json';
import th from './locales/th.json';
import vi from './locales/vi.json';
import id from './locales/id.json';
import ms from './locales/ms.json';
import fil from './locales/fil.json';
import bn from './locales/bn.json';
import ur from './locales/ur.json';
import fa from './locales/fa.json';
import uk from './locales/uk.json';
import be from './locales/be.json';
import ka from './locales/ka.json';
import hy from './locales/hy.json';
import az from './locales/az.json';
import kk from './locales/kk.json';
import ky from './locales/ky.json';
import uz from './locales/uz.json';
import tg from './locales/tg.json';
import mn from './locales/mn.json';
import ne from './locales/ne.json';
import si from './locales/si.json';
import my from './locales/my.json';
import km from './locales/km.json';
import lo from './locales/lo.json';
import am from './locales/am.json';
import sw from './locales/sw.json';
import yo from './locales/yo.json';
import ig from './locales/ig.json';
import ha from './locales/ha.json';
import zu from './locales/zu.json';
import af from './locales/af.json';
import xh from './locales/xh.json';
import st from './locales/st.json';
import tn from './locales/tn.json';
import ss from './locales/ss.json';
import ve from './locales/ve.json';
import ts from './locales/ts.json';
import nr from './locales/nr.json';
import nd from './locales/nd.json';
import sn from './locales/sn.json';
import rw from './locales/rw.json';
import lg from './locales/lg.json';
import ak from './locales/ak.json';
import tw from './locales/tw.json';
import ee from './locales/ee.json';
import ga from './locales/ga.json';
import cy from './locales/cy.json';
import eu from './locales/eu.json';
import ca from './locales/ca.json';
import gl from './locales/gl.json';
import ast from './locales/ast.json';
import oc from './locales/oc.json';
import br from './locales/br.json';
import co from './locales/co.json';
import fur from './locales/fur.json';
import sc from './locales/sc.json';
import vec from './locales/vec.json';
import lmo from './locales/lmo.json';
import pms from './locales/pms.json';
import rm from './locales/rm.json';
import gsw from './locales/gsw.json';
import lb from './locales/lb.json';
import fy from './locales/fy.json';
import li from './locales/li.json';
import zea from './locales/zea.json';
import vls from './locales/vls.json';
import wa from './locales/wa.json';
import pdc from './locales/pdc.json';
import yi from './locales/yi.json';
import hsb from './locales/hsb.json';
import dsb from './locales/dsb.json';
import ksh from './locales/ksh.json';
import bar from './locales/bar.json';
import swg from './locales/swg.json';
import pfl from './locales/pfl.json';
import sxu from './locales/sxu.json';
import wae from './locales/wae.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  pt: { translation: pt },
  ru: { translation: ru },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  ar: { translation: ar },
  hi: { translation: hi },
  tr: { translation: tr },
  nl: { translation: nl },
  pl: { translation: pl },
  sv: { translation: sv },
  da: { translation: da },
  no: { translation: no },
  fi: { translation: fi },
  cs: { translation: cs },
  hu: { translation: hu },
  ro: { translation: ro },
  bg: { translation: bg },
  hr: { translation: hr },
  sk: { translation: sk },
  sl: { translation: sl },
  et: { translation: et },
  lv: { translation: lv },
  lt: { translation: lt },
  el: { translation: el },
  he: { translation: he },
  th: { translation: th },
  vi: { translation: vi },
  id: { translation: id },
  ms: { translation: ms },
  fil: { translation: fil },
  bn: { translation: bn },
  ur: { translation: ur },
  fa: { translation: fa },
  uk: { translation: uk },
  be: { translation: be },
  ka: { translation: ka },
  hy: { translation: hy },
  az: { translation: az },
  kk: { translation: kk },
  ky: { translation: ky },
  uz: { translation: uz },
  tg: { translation: tg },
  mn: { translation: mn },
  ne: { translation: ne },
  si: { translation: si },
  my: { translation: my },
  km: { translation: km },
  lo: { translation: lo },
  am: { translation: am },
  sw: { translation: sw },
  yo: { translation: yo },
  ig: { translation: ig },
  ha: { translation: ha },
  zu: { translation: zu },
  af: { translation: af },
  xh: { translation: xh },
  st: { translation: st },
  tn: { translation: tn },
  ss: { translation: ss },
  ve: { translation: ve },
  ts: { translation: ts },
  nr: { translation: nr },
  nd: { translation: nd },
  sn: { translation: sn },
  rw: { translation: rw },
  lg: { translation: lg },
  ak: { translation: ak },
  tw: { translation: tw },
  ee: { translation: ee },
  ga: { translation: ga },
  cy: { translation: cy },
  eu: { translation: eu },
  ca: { translation: ca },
  gl: { translation: gl },
  ast: { translation: ast },
  oc: { translation: oc },
  br: { translation: br },
  co: { translation: co },
  fur: { translation: fur },
  sc: { translation: sc },
  vec: { translation: vec },
  lmo: { translation: lmo },
  pms: { translation: pms },
  rm: { translation: rm },
  gsw: { translation: gsw },
  lb: { translation: lb },
  fy: { translation: fy },
  li: { translation: li },
  zea: { translation: zea },
  vls: { translation: vls },
  wa: { translation: wa },
  pdc: { translation: pdc },
  yi: { translation: yi },
  hsb: { translation: hsb },
  dsb: { translation: dsb },
  ksh: { translation: ksh },
  bar: { translation: bar },
  swg: { translation: swg },
  pfl: { translation: pfl },
  sxu: { translation: sxu },
  wae: { translation: wae }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n; 